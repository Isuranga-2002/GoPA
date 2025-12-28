import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { db } from './config/db.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST' && req.body) {
    console.log('Body:', req.body);
  }
  next();
});

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('GoPA Backend is running 🚀');
});

// Test DB connection
db.query('SELECT 1')
  .then(() => console.log('✅ DB connection verified'))
  .catch((err) => console.error('❌ DB connection failed:', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
