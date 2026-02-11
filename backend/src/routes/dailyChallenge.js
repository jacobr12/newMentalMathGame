import express from 'express';
import DailyChallenge from '../models/DailyChallenge.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const PROBLEMS_PER_DAY = 10;
const CHALLENGE_TYPES = ['division', 'equation', 'multiplication'];
const DAILY_RESET_TIMEZONE = 'America/Los_Angeles';

// Today's date (YYYY-MM-DD) in Pacific time — daily challenges reset at midnight PT
function getTodayPacific() {
  return new Date().toLocaleDateString('en-CA', { timeZone: DAILY_RESET_TIMEZONE });
}

// Seeded RNG (simple LCG) for deterministic problems per day
function seededRandom(seed) {
  return function next() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function getDateSeed(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return y * 10000 + m * 100 + d;
}

function getSeedForType(dateStr, type) {
  const typeHash = type.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return getDateSeed(dateStr) + typeHash * 1000;
}

// ----- Division: 10 division problems (non-even), same for everyone -----
function generateDivisionProblems(dateStr) {
  const seed = getSeedForType(dateStr, 'division');
  const rng = seededRandom(seed);
  const problems = [];
  for (let i = 0; i < PROBLEMS_PER_DAY; i++) {
    const divisor = Math.floor(rng() * 98) + 2;
    const quotientInt = Math.floor(rng() * 80) + 10;
    const quotientDec = Math.floor(rng() * 99) / 100;
    const quotient = quotientInt + quotientDec;
    const dividend = Math.round(divisor * quotient);
    const exactAnswer = dividend / divisor;
    problems.push({
      problemIndex: i,
      a: dividend,
      b: divisor,
      exactAnswer,
    });
  }
  return problems;
}

// ----- Equation: 10 mixed expressions like 500/19 + (31*45) - 72 + (19*50), close + speed -----
// Terms: single integer, division a/b, (a*b), or (a*b ± c). Joined by + or -.
function generateEquationProblems(dateStr) {
  const seed = getSeedForType(dateStr, 'equation');
  const rng = seededRandom(seed);
  const rand = (lo, hi) => Math.floor(rng() * (hi - lo + 1)) + lo;

  const problems = [];
  for (let i = 0; i < PROBLEMS_PER_DAY; i++) {
    const numTerms = 3 + Math.floor(rng() * 3); // 3 to 5 terms
    const termTypes = ['single', 'division', 'product', 'product_plus'];
    const terms = [];
    const ops = []; // between terms: '+' or '-'

    for (let t = 0; t < numTerms; t++) {
      if (t > 0) ops.push(rng() < 0.5 ? '+' : '-');
      const kind = termTypes[Math.floor(rng() * termTypes.length)];
      let expr;
      switch (kind) {
        case 'single':
          expr = String(rand(5, 200));
          break;
        case 'division': {
          const b = rand(2, 25);
          const q = rand(2, 40);
          const a = b * q + (rng() < 0.3 ? rand(1, b - 1) : 0); // sometimes non-even
          expr = `${a} / ${b}`;
          break;
        }
        case 'product': {
          const a = rand(2, 99);
          const b = rand(2, 99);
          expr = `(${a} * ${b})`;
          break;
        }
        case 'product_plus': {
          const a = rand(2, 50);
          const b = rand(2, 50);
          const c = rand(1, 100);
          expr = rng() < 0.5 ? `(${a} * ${b} + ${c})` : `(${a} * ${b} - ${c})`;
          break;
        }
        default:
          expr = String(rand(10, 100));
      }
      terms.push(expr);
    }

    const expression = terms.map((term, idx) => (idx === 0 ? term : ` ${ops[idx - 1]} ${term}`)).join('');
    let exactAnswer;
    try {
      exactAnswer = Function(`"use strict"; return (${expression})`)();
    } catch {
      exactAnswer = 0;
    }
    if (typeof exactAnswer !== 'number' || !Number.isFinite(exactAnswer)) exactAnswer = 0;
    exactAnswer = Math.round(exactAnswer * 10000) / 10000;

    problems.push({
      problemIndex: i,
      expression: expression.trim(),
      exactAnswer,
    });
  }
  return problems;
}

// ----- Multiplication: 10 large-number multiplications, close + speed -----
function generateMultiplicationProblems(dateStr) {
  const seed = getSeedForType(dateStr, 'multiplication');
  const rng = seededRandom(seed);
  const problems = [];
  for (let i = 0; i < PROBLEMS_PER_DAY; i++) {
    const digitsA = 2 + Math.floor(rng() * 2); // 2 or 3
    const digitsB = 3 + Math.floor(rng() * 2); // 3 or 4
    const minA = 10 ** (digitsA - 1);
    const maxA = 10 ** digitsA - 1;
    const minB = 10 ** (digitsB - 1);
    const maxB = 10 ** digitsB - 1;
    const a = Math.floor(rng() * (maxA - minA + 1)) + minA;
    const b = Math.floor(rng() * (maxB - minB + 1)) + minB;
    const exactAnswer = a * b;
    problems.push({
      problemIndex: i,
      a,
      b,
      exactAnswer,
    });
  }
  return problems;
}

function generateProblemsForDate(dateStr, type = 'division') {
  if (type === 'equation') return generateEquationProblems(dateStr);
  if (type === 'multiplication') return generateMultiplicationProblems(dateStr);
  return generateDivisionProblems(dateStr);
}

// Two-phase speed: full score for first graceSeconds; then drop to 50% by T1; then drop to 0 by T2.
const SCORING_BY_TYPE = {
  division: { a: 2, b: 1.5, graceSeconds: 5, T1: 15, T2: 25 },
  equation: { a: 2, b: 1.5, graceSeconds: 10, T1: 20, T2: 45 },
  multiplication: { a: 2, b: 1.5, graceSeconds: 7, T1: 15, T2: 28 },
};

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function speed01FromTime(timeSeconds, type = 'division') {
  const p = SCORING_BY_TYPE[type] || SCORING_BY_TYPE.division;
  const { graceSeconds = 0, T1, T2 } = p;
  if (timeSeconds <= graceSeconds) return 1;
  if (timeSeconds <= T1) return clamp(1 - (timeSeconds - graceSeconds) / (T1 - graceSeconds) * 0.5, 0.5, 1);
  if (timeSeconds <= T2) return clamp(0.5 - (timeSeconds - T1) / (T2 - T1) * 0.5, 0, 0.5);
  return 0;
}

// Score one answer: accuracy and speed (two-phase drop).
function scoreAnswer(userAnswer, correctAnswer, timeTakenMs, type = 'division') {
  const params = SCORING_BY_TYPE[type] || SCORING_BY_TYPE.division;
  const { a, b } = params;
  const correct = Number(correctAnswer);
  const user = Number(userAnswer);
  if (isNaN(user)) return 0;
  const relError = correct === 0 ? (user === 0 ? 0 : 1) : Math.abs(user - correct) / Math.abs(correct);
  const acc01 = clamp(1 - Math.min(relError, 1), 0, 1);
  const timeSeconds = timeTakenMs / 1000;
  const speed01 = speed01FromTime(timeSeconds, type);
  const total01 = (acc01 ** a) * (speed01 ** b);
  return Math.round(100 * total01 * 100) / 100;
}

function validateType(type) {
  return CHALLENGE_TYPES.includes(type) ? type : 'division';
}

function typeFilter(type) {
  if (type === 'division') {
    return { $or: [{ type: 'division' }, { type: { $exists: false } }] };
  }
  return { type };
}

// @route   GET /api/daily-challenge/problems
// @query   date=YYYY-MM-DD, type=division|equation|multiplication
// @access  Public
router.get('/problems', (req, res) => {
  try {
    const dateStr = req.query.date || getTodayPacific();
    const type = validateType(req.query.type || 'division');
    const problems = generateProblemsForDate(dateStr, type);
    const clientProblems = problems.map((p) => {
      if (p.expression != null) return { problemIndex: p.problemIndex, expression: p.expression };
      return { problemIndex: p.problemIndex, a: p.a, b: p.b };
    });
    res.json({ date: dateStr, type, problems: clientProblems });
  } catch (error) {
    console.error('Daily challenge problems error:', error);
    res.status(500).json({ message: 'Server error fetching daily challenge' });
  }
});

// @route   POST /api/daily-challenge/score-only
// @body    { date, type?, answers }
// @access  Public
router.post('/score-only', (req, res) => {
  try {
    const { date: dateStr, type: bodyType, answers } = req.body;
    const date = dateStr || getTodayPacific();
    const type = validateType(bodyType || req.query.type || 'division');
    if (!Array.isArray(answers) || answers.length !== PROBLEMS_PER_DAY) {
      return res.status(400).json({ message: `Must submit exactly ${PROBLEMS_PER_DAY} answers` });
    }
    const problems = generateProblemsForDate(date, type);
    const results = [];
    let totalScore = 0;
    for (let i = 0; i < PROBLEMS_PER_DAY; i++) {
      const prob = problems[i];
      const ans = answers.find((a) => a.problemIndex === i) || answers[i];
      const timeTaken = Math.max(0, Number(ans?.timeTaken) || 0);
      const userAnswer = Number(ans?.userAnswer);
      const problemScore = scoreAnswer(userAnswer, prob.exactAnswer, timeTaken, type);
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
// @body    { date, type?, answers }
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { date: dateStr, type: bodyType, answers } = req.body;
    const date = dateStr || getTodayPacific();
    const type = validateType(bodyType || 'division');
    if (!Array.isArray(answers) || answers.length !== PROBLEMS_PER_DAY) {
      return res.status(400).json({ message: `Must submit exactly ${PROBLEMS_PER_DAY} answers` });
    }

    const existing = await DailyChallenge.findOne({ date, user: req.user._id, ...typeFilter(type) });
    if (existing) {
      return res.status(403).json({
        message: "You've already completed today's challenge. One attempt per day.",
        alreadySubmitted: true,
        score: existing.score,
      });
    }

    const problems = generateProblemsForDate(date, type);
    const results = [];
    let totalScore = 0;
    for (let i = 0; i < PROBLEMS_PER_DAY; i++) {
      const prob = problems[i];
      const ans = answers.find((a) => a.problemIndex === i) || answers[i];
      const timeTaken = Math.max(0, Number(ans?.timeTaken) || 0);
      const userAnswer = Number(ans?.userAnswer);
      const problemScore = scoreAnswer(userAnswer, prob.exactAnswer, timeTaken, type);
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
      type,
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
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You've already submitted this challenge for today. One attempt per challenge type per day.",
        code: 'DUPLICATE',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message || 'Validation failed' });
    }
    res.status(500).json({ message: 'Server error submitting daily challenge' });
  }
});

// @route   GET /api/daily-challenge/leaderboard
// @query   date, type?, limit
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const dateStr = req.query.date || getTodayPacific();
    const type = validateType(req.query.type || 'division');
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const docs = await DailyChallenge.find({ date: dateStr, ...typeFilter(type) })
      .sort({ score: -1 })
      .limit(limit)
      .populate('user', 'name email');
    const leaderboard = docs.map((d, i) => ({
      rank: i + 1,
      userId: d.user._id,
      name: d.user?.name || 'Anonymous',
      score: d.score,
    }));
    res.json({ date: dateStr, type, leaderboard });
  } catch (error) {
    console.error('Daily challenge leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// @route   GET /api/daily-challenge/my-history
// @query   type?, days? (default 30, max 365)
// @desc    Get current user's past daily challenge submissions with avg score for that day/type
// @access  Private
router.get('/my-history', protect, async (req, res) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
    const endDate = getTodayPacific();
    // Build startDate in calendar terms: parse endDate as YYYY-MM-DD, subtract days, format in Pacific
    const [y, m, d] = endDate.split('-').map(Number);
    const endAsDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const startAsDate = new Date(endAsDate.getTime() - days * 24 * 60 * 60 * 1000);
    const startDate = startAsDate.toLocaleDateString('en-CA', { timeZone: DAILY_RESET_TIMEZONE });

    const userFilter = { user: req.user._id, date: { $gte: startDate, $lte: endDate } };
    const typeParam = req.query.type;
    if (typeParam && CHALLENGE_TYPES.includes(typeParam)) {
      Object.assign(userFilter, typeFilter(typeParam));
    }

    const userDocs = await DailyChallenge.find(userFilter).sort({ date: -1 }).lean();

    if (userDocs.length === 0) {
      return res.json({ results: [] });
    }

    const avgByDateType = await DailyChallenge.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $addFields: { typeNorm: { $ifNull: ['$type', 'division'] } } },
      { $group: { _id: { date: '$date', type: '$typeNorm' }, avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
    ]);

    const avgMap = {};
    avgByDateType.forEach((row) => {
      const key = `${row._id.date}\t${row._id.type}`;
      avgMap[key] = { avgScore: Math.round(row.avgScore * 100) / 100, count: row.count };
    });

    const results = userDocs.map((d) => {
      const typeNorm = d.type || 'division';
      const key = `${d.date}\t${typeNorm}`;
      const avg = avgMap[key];
      return {
        date: d.date,
        type: typeNorm,
        score: d.score,
        avgScoreThatDay: avg ? avg.avgScore : null,
        participantCount: avg ? avg.count : null,
      };
    });

    res.json({ results });
  } catch (error) {
    console.error('Daily challenge my-history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/daily-challenge/me
// @query   date, type?
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const dateStr = req.query.date || getTodayPacific();
    const type = validateType(req.query.type || 'division');
    const doc = await DailyChallenge.findOne({ date: dateStr, user: req.user._id, ...typeFilter(type) });
    res.json({
      date: dateStr,
      type,
      score: doc ? doc.score : null,
      submitted: !!doc,
    });
  } catch (error) {
    console.error('Daily challenge me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/daily-challenge/reset-day
// @query   date?, type?, secret
// @access  Protected by secret
router.delete('/reset-day', async (req, res) => {
  try {
    const expectedSecret = process.env.RESET_DAILY_SECRET;
    if (!expectedSecret || req.query.secret !== expectedSecret) {
      return res.status(403).json({ message: 'Invalid or missing secret' });
    }
    const dateStr = req.query.date || getTodayPacific();
    const type = req.query.type;
    const filter = { date: dateStr };
    if (type && CHALLENGE_TYPES.includes(type)) filter.type = type;
    const result = await DailyChallenge.deleteMany(filter);
    res.json({
      message: `Daily challenge reset for ${dateStr}${type ? ` (type: ${type})` : ''}`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Reset daily challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
