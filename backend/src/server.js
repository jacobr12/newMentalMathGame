import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import statsRoutes from './routes/stats.js';
import dailyChallengeRoutes from './routes/dailyChallenge.js';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin early (before routes)
import './config/firebase-admin.js';

// Connect to database
connectDB();

const app = express();

// Middleware: allow frontend origin (and any *.vercel.app for previews)
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin === allowedOrigin) return cb(null, true);
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
