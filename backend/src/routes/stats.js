import express from 'express';
import Stats from '../models/Stats.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to get digit category (1d, 2d, 3d+)
function getDigitCategory(num) {
  const digits = String(Math.abs(num)).length;
  if (digits === 1) return '1d';
  if (digits === 2) return '2d';
  return '3d+';
}

// Helper to get operation key
function getOperationKey(operator) {
  if (operator === '+') return 'add';
  if (operator === '-') return 'sub';
  if (operator === '*') return 'mul';
  if (operator === '/') return 'div';
  return 'other';
}

// Helper to update stat aggregates
function updateStatAggregate(stats, key, correct, timeMs) {
  if (!stats[key]) {
    stats[key] = { attempts: 0, correct: 0, avgTime: 0, totalTime: 0 };
  }
  const newAttempts = stats[key].attempts + 1;
  const newCorrect = stats[key].correct + (correct ? 1 : 0);
  const newTotalTime = stats[key].totalTime + (timeMs / 1000); // convert to seconds
  const newAvgTime = Math.round((newTotalTime / newAttempts) * 100) / 100;

  stats[key] = {
    attempts: newAttempts,
    correct: newCorrect,
    avgTime: newAvgTime,
    totalTime: newTotalTime,
  };
}

// @route   GET /api/stats
// @desc    Get user statistics
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let stats = await Stats.findOne({ user: req.user._id });

    // Create stats if they don't exist
    if (!stats) {
      stats = await Stats.create({
        user: req.user._id,
      });
    }

    // Calculate accuracy
    const accuracy =
      stats.totalProblems > 0
        ? Math.round((stats.correctAnswers / stats.totalProblems) * 100)
        : 0;

    // Normalize Maps to objects for JSON response
    let operationStats = stats.operationStats || {};
    let digitCategoryStats = stats.digitCategoryStats || {};
    let combinedCategoryStats = {};

    if (stats.combinedCategoryStats) {
      if (stats.combinedCategoryStats instanceof Map) {
        combinedCategoryStats = Object.fromEntries(stats.combinedCategoryStats);
      } else if (typeof stats.combinedCategoryStats === 'object') {
        combinedCategoryStats = stats.combinedCategoryStats;
      }
    }

    res.json({
      totalProblems: stats.totalProblems,
      correctAnswers: stats.correctAnswers,
      accuracy,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      averageTime: stats.averageTime,
      difficultyStats: stats.difficultyStats,
      highestScoreByDifficulty: stats.highestScoreByDifficulty || {},
      averageScoreByDifficulty: stats.averageScoreByDifficulty || {},
      operationStats,
      digitCategoryStats,
      combinedCategoryStats,
      lastPlayedDate: stats.lastPlayedDate,
      sessions: stats.sessions || [],
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// @route   POST /api/stats/session
// @desc    Save a practice session
// @access  Private
router.post('/session', protect, async (req, res) => {
  try {
    const {
      score,
      timeLimit,
      difficulty,
      operations,
      timeElapsed,
      totalProblems,
      problems = [], // array of { a,b,operator,correct,attempted,timeTaken }
    } = req.body;

    let stats = await Stats.findOne({ user: req.user._id });

    if (!stats) {
      stats = await Stats.create({
        user: req.user._id,
      });
    }

    // Update overall stats
    stats.totalProblems += totalProblems || 0;
    stats.correctAnswers += score || 0;
    stats.totalTime += timeElapsed || 0;

    // Calculate average time
    if (stats.totalProblems > 0) {
      stats.averageTime = Math.round(
        stats.totalTime / stats.totalProblems
      );
    }

    const diffKey = difficulty || 'easy';

    // Update difficulty stats
    stats.difficultyStats[diffKey].problems += totalProblems || 0;
    stats.difficultyStats[diffKey].correct += score || 0;

    // Update highest score for this difficulty
    if (!stats.highestScoreByDifficulty) {
      stats.highestScoreByDifficulty = { easy: 0, medium: 0, hard: 0, custom: 0 };
    }
    if ((score || 0) > (stats.highestScoreByDifficulty[diffKey] || 0)) {
      stats.highestScoreByDifficulty[diffKey] = score || 0;
    }

    // Update average score for this difficulty
    if (!stats.averageScoreByDifficulty) {
      stats.averageScoreByDifficulty = { easy: 0, medium: 0, hard: 0, custom: 0 };
    }
    const diffProblems = stats.difficultyStats[diffKey].problems || 1;
    const totalScoreForDiff = (stats.averageScoreByDifficulty[diffKey] || 0) * (diffProblems - (totalProblems || 0)) + (score || 0);
    stats.averageScoreByDifficulty[diffKey] = Math.round((totalScoreForDiff / diffProblems) * 100) / 100;

    // Initialize aggregates if missing
    if (!stats.operationStats) {
      stats.operationStats = { add: {}, sub: {}, mul: {}, div: {} };
    }
    if (!stats.digitCategoryStats) {
      stats.digitCategoryStats = { '1d': {}, '2d': {}, '3d+': {} };
    }
    if (!stats.combinedCategoryStats) {
      stats.combinedCategoryStats = new Map();
    }

    // Process per-problem stats
    if (Array.isArray(problems) && problems.length > 0) {
      problems.forEach((p) => {
        try {
          const op = p.operator || '';
          const a = Number(p.a || 0);
          const b = Number(p.b || 0);
          const correct = !!p.correct && !!p.attempted; // only count attempted problems
          const timeMs = Math.max(0, Number(p.timeTaken || 0));

          const opKey = getOperationKey(op);
          const digitCat = getDigitCategory(Math.max(Math.abs(a), Math.abs(b)));
          const combinedKey = `${opKey}_${digitCat}`;

          // Update operation stats
          updateStatAggregate(stats.operationStats, opKey, correct, timeMs);

          // Update digit category stats
          updateStatAggregate(stats.digitCategoryStats, digitCat, correct, timeMs);

          // Update combined category stats (Map)
          const existing = stats.combinedCategoryStats.get(combinedKey) || {
            attempts: 0,
            correct: 0,
            avgTime: 0,
            totalTime: 0,
          };
          const newAttempts = existing.attempts + 1;
          const newCorrect = existing.correct + (correct ? 1 : 0);
          const newTotalTime = existing.totalTime + timeMs / 1000;
          const newAvgTime = Math.round((newTotalTime / newAttempts) * 100) / 100;

          stats.combinedCategoryStats.set(combinedKey, {
            attempts: newAttempts,
            correct: newCorrect,
            avgTime: newAvgTime,
            totalTime: newTotalTime,
          });
        } catch (e) {
          console.error('Error processing problem:', e);
        }
      });
    }

    // Update streak
    const today = new Date();
    const lastPlayed = new Date(stats.lastPlayedDate);
    const daysDiff = Math.floor(
      (today - lastPlayed) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day - continue
    } else if (daysDiff === 1) {
      // Next day - increment streak
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
    } else {
      // Streak broken
      stats.currentStreak = 1;
    }

    stats.lastPlayedDate = new Date();

    // Add session record
    stats.sessions.push({
      date: new Date(),
      score: score || 0,
      timeLimit: timeLimit || 60,
      difficulty: diffKey,
      operations: operations || [],
      problems: Array.isArray(problems) ? problems : [],
    });

    // Keep only last 50 sessions
    if (stats.sessions.length > 50) {
      stats.sessions = stats.sessions.slice(-50);
    }

    await stats.save();

    res.json({
      message: 'Session saved successfully',
      stats: {
        totalProblems: stats.totalProblems,
        correctAnswers: stats.correctAnswers,
        currentStreak: stats.currentStreak,
      },
    });
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({ message: 'Server error saving session' });
  }
});

// @route   PUT /api/stats/reset
// @desc    Reset user statistics
// @access  Private
router.put('/reset', protect, async (req, res) => {
  try {
    const stats = await Stats.findOne({ user: req.user._id });

    if (!stats) {
      return res.status(404).json({ message: 'Stats not found' });
    }

    stats.totalProblems = 0;
    stats.correctAnswers = 0;
    stats.totalTime = 0;
    stats.averageTime = 0;
    stats.currentStreak = 0;
    stats.longestStreak = 0;
    stats.sessions = [];
    stats.difficultyStats = {
      easy: { problems: 0, correct: 0 },
      medium: { problems: 0, correct: 0 },
      hard: { problems: 0, correct: 0 },
      custom: { problems: 0, correct: 0 },
    };
    stats.highestScoreByDifficulty = { easy: 0, medium: 0, hard: 0, custom: 0 };
    stats.averageScoreByDifficulty = { easy: 0, medium: 0, hard: 0, custom: 0 };
    stats.operationStats = {
      add: { attempts: 0, correct: 0, avgTime: 0 },
      sub: { attempts: 0, correct: 0, avgTime: 0 },
      mul: { attempts: 0, correct: 0, avgTime: 0 },
      div: { attempts: 0, correct: 0, avgTime: 0 },
    };
    stats.digitCategoryStats = {
      '1d': { attempts: 0, correct: 0, avgTime: 0 },
      '2d': { attempts: 0, correct: 0, avgTime: 0 },
      '3d+': { attempts: 0, correct: 0, avgTime: 0 },
    };
    stats.combinedCategoryStats = new Map();

    await stats.save();

    res.json({ message: 'Stats reset successfully' });
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({ message: 'Server error resetting stats' });
  }
});

export default router;
