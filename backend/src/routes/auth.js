import express from 'express';
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin1@gopa' && password === 'qrs%253QT!#@$') {
    return res.json({ message: 'Admin logged in successfully', role: 'admin' });
  }

  // TODO: Add student login logic here
  res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
