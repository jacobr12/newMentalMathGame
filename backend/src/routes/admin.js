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

// Helper: filter by challenge type (legacy division has no type)
function typeFilter(type) {
  if (type === 'division') {
    return { $or: [{ type: 'division' }, { type: { $exists: false } }] };
  }
  return type ? { type } : {};
}

// @route   GET /api/admin/daily-challenge/results
// @query   date=YYYY-MM-DD, type=division|equation|multiplication
// @desc    Get all submissions for a date/type with user info and full answers (admin only)
// @access  Private (admin)
router.get('/daily-challenge/results', async (req, res) => {
  try {
    const dateStr = req.query.date || getTodayPacific();
    const type = req.query.type;
    const filter = { date: dateStr, ...typeFilter(type) };
    const docs = await DailyChallenge.find(filter)
      .sort({ score: -1 })
      .populate('user', 'name email')
      .lean();
    const results = docs.map((d) => ({
      _id: d._id,
      user: d.user ? { _id: d.user._id, name: d.user.name, email: d.user.email } : null,
      score: d.score,
      answers: d.answers || [],
    }));
    res.json({ date: dateStr, type: type || 'division', results });
  } catch (error) {
    console.error('Admin daily challenge results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Shared handler for updating a user's daily challenge score (PATCH and POST)
async function updateDailyChallengeScoreHandler(req, res) {
  try {
    const { userId, date: dateStr, type: bodyType, score: newScore } = req.body;
    if (!userId || !dateStr) {
      return res.status(400).json({ message: 'userId and date are required' });
    }
    const scoreNum = Number(newScore);
    if (!Number.isFinite(scoreNum) || scoreNum < 0) {
      return res.status(400).json({ message: 'score must be a non-negative number' });
    }
    const type = bodyType && CHALLENGE_TYPES.includes(bodyType) ? bodyType : 'division';
    const filter = { date: dateStr, user: userId, ...typeFilter(type) };
    const doc = await DailyChallenge.findOne(filter);
    if (!doc) {
      return res.status(404).json({ message: 'Daily challenge submission not found for this user, date, and type' });
    }
    const oldTotal = doc.score || 0;
    doc.score = Math.round(scoreNum * 100) / 100;
    if (Array.isArray(doc.answers) && doc.answers.length > 0 && oldTotal > 0) {
      const ratio = doc.score / oldTotal;
      let sum = 0;
      for (let i = 0; i < doc.answers.length - 1; i++) {
        const scaled = (doc.answers[i].problemScore || 0) * ratio;
        const rounded = Math.round(scaled * 100) / 100;
        doc.answers[i].problemScore = rounded;
        sum += rounded;
      }
      doc.answers[doc.answers.length - 1].problemScore = Math.round((doc.score - sum) * 100) / 100;
    }
    await doc.save();
    res.json({
      message: 'Score updated',
      score: doc.score,
      submissionId: doc._id,
    });
  } catch (error) {
    console.error('Admin update daily challenge score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// @route   PATCH /api/admin/daily-challenge/score
// @route   POST /api/admin/daily-challenge/score  (alias for hosts that don't support PATCH)
// @body    { userId, date, type?, score }
// @access  Private (admin)
router.patch('/daily-challenge/score', updateDailyChallengeScoreHandler);
router.post('/daily-challenge/score', updateDailyChallengeScoreHandler);

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
