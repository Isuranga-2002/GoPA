import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import dotenv from 'dotenv';

console.log('✅ auth.js loaded successfully');


dotenv.config();
const router = express.Router();

// 🧍 Register
router.post('/register', async (req, res) => {
  const { username, index, email, password } = req.body;

  try {
    // 1. Verify student authorization
    const [rows] = await db.execute(
      'SELECT * FROM authorized_students WHERE index_number = ? AND email = ?',
      [index, email]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Not an authorized student' });
    }

    // 2. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 2. Check if user already exists
    const [existingUser] = await db.execute(
      'SELECT * FROM users WHERE index_number = ? OR email = ?',
      [index, email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already registered with this index or email' });
    }

    // 3. Save new user
    await db.execute(
      'INSERT INTO users (username, index_number, email, password) VALUES (?, ?, ?, ?)',
      [username, index, email, hashed]
    );


    // 4. Update authorization status
    await db.execute(
      'UPDATE authorized_students SET status = ? WHERE email = ?',
      ['registered', email]
    );

    // 5. Generate token
    const token = jwt.sign({ email, index }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({
      message: 'Registration successful',
      token,
      user: {
        username,
        index,
        email
        }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔑 Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Admin login (static)
  if (username === 'admin1@gopa' && password === 'qrs%253QT!#@$') {
    return res.json({ message: 'Admin login success', role: 'admin' });
  }

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = users[0];
    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '2h'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;

