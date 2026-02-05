import express from 'express';
import User from '../models/User.js';
import DailyChallenge from '../models/DailyChallenge.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();
const CHALLENGE_TYPES = ['division', 'equation', 'multiplication'];
const DAILY_RESET_TIMEZONE = 'America/Los_Angeles';

function getTodayPacific() {
  return new Date().toLocaleDateString('en-CA', { timeZone: DAILY_RESET_TIMEZONE });
}

// All admin routes require auth + admin
router.use(protect, adminOnly);

// @route   GET /api/admin/users
// @desc    List all users (admin only)
// @access  Private (admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ users });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/daily-challenge/reset
// @body    { date?, type? }  date = YYYY-MM-DD, type = division|equation|multiplication
// @access  Private (admin)
router.delete('/daily-challenge/reset', async (req, res) => {
  try {
    const dateStr = req.body?.date || req.query?.date || getTodayPacific();
    const type = req.body?.type || req.query?.type;
    const filter = { date: dateStr };
    if (type && CHALLENGE_TYPES.includes(type)) filter.type = type;
    const result = await DailyChallenge.deleteMany(filter);
    res.json({
      message: `Daily challenge reset for ${dateStr}${type ? ` (type: ${type})` : ' (all types)'}`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Admin reset daily challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
