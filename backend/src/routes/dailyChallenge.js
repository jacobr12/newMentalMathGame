import express from 'express';
import DailyChallenge from '../models/DailyChallenge.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const PROBLEMS_PER_DAY = 10;

// Seeded RNG (simple LCG) for deterministic problems per day
function seededRandom(seed) {
  return function next() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function getDateSeed(dateStr) {
  // dateStr = YYYY-MM-DD
  const [y, m, d] = dateStr.split('-').map(Number);
  return y * 10000 + m * 100 + d;
}

// Generate 10 division problems for a date (non-even division, same for everyone)
function generateProblemsForDate(dateStr) {
  const seed = getDateSeed(dateStr);
  const rng = seededRandom(seed);
  const problems = [];
  for (let i = 0; i < PROBLEMS_PER_DAY; i++) {
    // Divisor 2-99, quotient with decimals so division doesn't divide evenly
    const divisor = Math.floor(rng() * 98) + 2;
    const quotientInt = Math.floor(rng() * 80) + 10;
    const quotientDec = Math.floor(rng() * 99) / 100; // 0.00 to 0.99
    const quotient = quotientInt + quotientDec;
    const dividend = Math.round(divisor * quotient);
    const exactAnswer = dividend / divisor;
    problems.push({
      problemIndex: i,
      a: dividend,
      b: divisor,
      exactAnswer, // server-only, not sent to client
    });
  }
  return problems;
}

// Score one answer: balance accuracy and speed. Max 100 per problem.
// accuracyWeight 0.6, speed 0.4. Encourages both close and fast.
function scoreAnswer(userAnswer, correctAnswer, timeTakenMs) {
  const correct = Number(correctAnswer);
  const user = Number(userAnswer);
  if (isNaN(user)) return 0;
  const relError = correct === 0 ? (user === 0 ? 0 : 1) : Math.abs(user - correct) / Math.abs(correct);
  const accuracyScore = Math.max(0, 100 - 100 * Math.min(relError, 1));
  const timeSeconds = timeTakenMs / 1000;
  const speedScore = Math.max(0, 100 - timeSeconds * 5); // lose 5 points per second, 0 at 20s
  const total = 0.6 * accuracyScore + 0.4 * speedScore;
  return Math.round(total * 100) / 100;
}

// @route   GET /api/daily-challenge/problems
// @query   date=YYYY-MM-DD (optional, default today UTC)
// @access  Public (so unauthenticated users can see problems; submit requires auth)
router.get('/problems', (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const problems = generateProblemsForDate(dateStr);
    res.json({
      date: dateStr,
      problems: problems.map(({ problemIndex, a, b }) => ({ problemIndex, a, b })),
    });
  } catch (error) {
    console.error('Daily challenge problems error:', error);
    res.status(500).json({ message: 'Server error fetching daily challenge' });
  }
});

// @route   POST /api/daily-challenge/score-only
// @body    { date: YYYY-MM-DD, answers: [ { problemIndex, userAnswer, timeTaken } ] }
// @access  Public (no save - so unauthenticated users can see their score)
router.post('/score-only', (req, res) => {
  try {
    const { date: dateStr, answers } = req.body;
    const date = dateStr || new Date().toISOString().slice(0, 10);
    if (!Array.isArray(answers) || answers.length !== PROBLEMS_PER_DAY) {
      return res.status(400).json({ message: `Must submit exactly ${PROBLEMS_PER_DAY} answers` });
    }
    const problems = generateProblemsForDate(date);
    const results = [];
    let totalScore = 0;
    for (let i = 0; i < PROBLEMS_PER_DAY; i++) {
      const prob = problems[i];
      const ans = answers.find((a) => a.problemIndex === i) || answers[i];
      const timeTaken = Math.max(0, Number(ans?.timeTaken) || 0);
      const userAnswer = Number(ans?.userAnswer);
      const problemScore = scoreAnswer(userAnswer, prob.exactAnswer, timeTaken);
      totalScore += problemScore;
      results.push({
        problemIndex: i,
        userAnswer,
        correctAnswer: prob.exactAnswer,
        timeTaken,
        problemScore,
      });
    }
    totalScore = Math.round(totalScore * 100) / 100;
    res.json({ score: totalScore, breakdown: results });
  } catch (error) {
    console.error('Daily challenge score-only error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/daily-challenge/submit
// @body    { date: YYYY-MM-DD, answers: [ { problemIndex, userAnswer, timeTaken } ] }
// @access  Private
// One attempt per user per day: if already submitted, reject.
router.post('/submit', protect, async (req, res) => {
  try {
    const { date: dateStr, answers } = req.body;
    const date = dateStr || new Date().toISOString().slice(0, 10);
    if (!Array.isArray(answers) || answers.length !== PROBLEMS_PER_DAY) {
      return res.status(400).json({ message: `Must submit exactly ${PROBLEMS_PER_DAY} answers` });
    }

    const existing = await DailyChallenge.findOne({ date, user: req.user._id });
    if (existing) {
      return res.status(403).json({
        message: "You've already completed today's challenge. One attempt per day.",
        alreadySubmitted: true,
        score: existing.score,
      });
    }

    const problems = generateProblemsForDate(date);
    const results = [];
    let totalScore = 0;
    for (let i = 0; i < PROBLEMS_PER_DAY; i++) {
      const prob = problems[i];
      const ans = answers.find((a) => a.problemIndex === i) || answers[i];
      const timeTaken = Math.max(0, Number(ans?.timeTaken) || 0);
      const userAnswer = Number(ans?.userAnswer);
      const problemScore = scoreAnswer(userAnswer, prob.exactAnswer, timeTaken);
      totalScore += problemScore;
      results.push({
        problemIndex: i,
        userAnswer,
        correctAnswer: prob.exactAnswer,
        timeTaken,
        problemScore,
      });
    }

    totalScore = Math.round(totalScore * 100) / 100;

    await DailyChallenge.create({
      date,
      user: req.user._id,
      score: totalScore,
      answers: results,
    });

    res.json({
      message: 'Submission saved',
      score: totalScore,
      bestScore: totalScore,
      isNewBest: true,
      breakdown: results,
    });
  } catch (error) {
    console.error('Daily challenge submit error:', error);
    res.status(500).json({ message: 'Server error submitting daily challenge' });
  }
});

// @route   GET /api/daily-challenge/leaderboard
// @query   date=YYYY-MM-DD, limit=20
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const docs = await DailyChallenge.find({ date: dateStr })
      .sort({ score: -1 })
      .limit(limit)
      .populate('user', 'name email');
    const leaderboard = docs.map((d, i) => ({
      rank: i + 1,
      userId: d.user._id,
      name: d.user?.name || 'Anonymous',
      score: d.score,
    }));
    res.json({ date: dateStr, leaderboard });
  } catch (error) {
    console.error('Daily challenge leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// @route   GET /api/daily-challenge/me
// @query   date=YYYY-MM-DD
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const doc = await DailyChallenge.findOne({ date: dateStr, user: req.user._id });
    res.json({
      date: dateStr,
      score: doc ? doc.score : null,
      submitted: !!doc,
    });
  } catch (error) {
    console.error('Daily challenge me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/daily-challenge/reset-day
// @query   date=YYYY-MM-DD (optional, default today), secret=RESET_DAILY_SECRET from env
// @access  Protected by secret (for admin / before going live)
router.delete('/reset-day', async (req, res) => {
  try {
    const expectedSecret = process.env.RESET_DAILY_SECRET;
    if (!expectedSecret || req.query.secret !== expectedSecret) {
      return res.status(403).json({ message: 'Invalid or missing secret' });
    }
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const result = await DailyChallenge.deleteMany({ date: dateStr });
    res.json({
      message: `Daily challenge reset for ${dateStr}`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Reset daily challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
