import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

console.log('✅ auth.js loaded successfully');


dotenv.config();
const router = express.Router();

// 🧩 Setup Nodemailer Transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB
    await db.execute('INSERT INTO otp_verifications (email, otp) VALUES (?, ?)', [email, otp]);

    // Send OTP email
    await transporter.sendMail({
      from: `"GoPA Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your GoPA Verification Code',
      text: `Your OTP for GoPA registration is: ${otp}. It will expire in 10 minutes.`,
    });

    return res.status(200).json({ message: 'OTP sent successfully' });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'OTP not found. Please request again.' });
    }

    if (rows[0].otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Delete OTP after verification
    await db.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
});

// Verify if student exists in authorized_students
router.post('/verify-student', async (req, res) => {
  const { index, email } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM authorized_students WHERE index_number = ? AND email = ?',
      [index, email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Not an authorized student' });
    }

    res.json({ message: 'Student verified successfully' });
  } catch (error) {
    console.error('Error verifying student:', error);
    res.status(500).json({ message: 'Server error verifying student' });
  }
});

export default router;

