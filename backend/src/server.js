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
app.use(cors());
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
