import express from 'express';
import Stats from '../models/Stats.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper: digit count of a number (1 = 1-9, 2 = 10-99, 3 = 100+)
function digitCount(n) {
  const val = Math.abs(Math.floor(Number(n) || 0));
  if (val < 10) return 1;
  if (val < 100) return 2;
  return 3;
}

// Helper to get digit category (1d, 2d, 3d+)
// Single digit = lowest number in problem is single digit; double = lowest is double digit; etc.
// For division: use lowest of divisor (b) and quotient (a/b).
function getDigitCategory(a, b, operator) {
  const op = String(operator || '').trim();
  const na = Number(a);
  const nb = Number(b);
  let count = 1;
  if (op === '/') {
    const quotient = nb !== 0 ? Math.floor(na / nb) : 0;
    count = Math.min(digitCount(nb), digitCount(quotient));
  } else {
    // +, -, *: use minimum of the two operands
    count = Math.min(digitCount(na), digitCount(nb));
  }
  if (count === 1) return '1d';
  if (count === 2) return '2d';
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

// Helper to update stat aggregates - only count attempted problems with valid time
function updateStatAggregate(stats, key, correct, timeMs) {
  if (!stats[key]) {
    stats[key] = { attempts: 0, correct: 0, avgTime: 0, totalTime: 0, timeCount: 0 };
  }
  
  // Ensure all fields are valid numbers
  const currentAttempts = Number(stats[key].attempts || 0) || 0;
  const currentCorrect = Number(stats[key].correct || 0) || 0;
  const currentTotalTime = Number(stats[key].totalTime || 0) || 0;
  const currentTimeCount = Number(stats[key].timeCount || 0) || 0; // How many problems had valid time
  
  // Convert time to seconds and validate
  const timeSeconds = Number(timeMs || 0) / 1000;
  const hasValidTime = !isNaN(timeSeconds) && timeSeconds > 0 && timeMs > 0;
  
  const newAttempts = currentAttempts + 1;
  const newCorrect = currentCorrect + (correct ? 1 : 0);
  
  // Only add time if it's valid
  let newTotalTime = currentTotalTime;
  let newTimeCount = currentTimeCount;
  
  if (hasValidTime) {
    newTotalTime = currentTotalTime + timeSeconds;
    newTimeCount = currentTimeCount + 1;
  }
  
  // Calculate average time - only from problems with valid time
  const newAvgTime = newTimeCount > 0 
    ? Math.round((newTotalTime / newTimeCount) * 100) / 100 
    : 0;
  
  // Ensure we never set NaN
  stats[key] = {
    attempts: newAttempts,
    correct: newCorrect,
    avgTime: isNaN(newAvgTime) ? 0 : newAvgTime,
    totalTime: isNaN(newTotalTime) ? 0 : newTotalTime,
    timeCount: newTimeCount, // Track how many had valid time
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
    let categoryStats = {};
    if (stats.categoryStats && stats.categoryStats instanceof Map) {
      categoryStats = Object.fromEntries(stats.categoryStats);
    } else if (stats.categoryStats && typeof stats.categoryStats === 'object') {
      categoryStats = stats.categoryStats;
    }

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
      categoryStats,
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
      category, // optional: easy, medium, hard, custom, addition, division, multiplication, 2digit-mult
      operations,
      timeElapsed,
      totalProblems,
      problems = [], // array of { a,b,operator,correct,attempted,timeTaken }
    } = req.body;

    // Validate input
    const validatedTotalProblems = Math.max(0, Number(totalProblems) || 0)
    const validatedScore = Math.max(0, Number(score) || 0)
    const validatedTimeElapsed = Math.max(0, Number(timeElapsed) || 0)
    const validatedProblems = Array.isArray(problems) ? problems : []

    console.log('📊 Saving session:', {
      userId: req.user._id,
      score: validatedScore,
      totalProblems: validatedTotalProblems,
      difficulty,
      problemsCount: validatedProblems.length,
      problemsSample: validatedProblems.slice(0, 3).map(p => `${p.a}${p.operator}${p.b}`),
    });

    let stats = await Stats.findOne({ user: req.user._id });

    if (!stats) {
      console.log('📝 Creating new stats record for user')
      stats = await Stats.create({
        user: req.user._id,
      });
    }

    // Update overall stats - use validated values
    stats.totalProblems += validatedTotalProblems
    stats.correctAnswers += validatedScore
    
    // Calculate total time from attempted problems only (not session time)
    let totalTimeFromProblems = 0
    let attemptedProblemsCount = 0
    
    validatedProblems.forEach((p) => {
      if (p.attempted && p.timeTaken && p.timeTaken > 0) {
        totalTimeFromProblems += (p.timeTaken / 1000) // Convert ms to seconds
        attemptedProblemsCount++
      }
    })
    
    // Update total time with actual problem times (not session elapsed time)
    stats.totalTime += totalTimeFromProblems

    // Calculate average time - only count attempted problems with valid time
    if (attemptedProblemsCount > 0) {
      // Calculate average for this session
      const sessionAvgTime = totalTimeFromProblems / attemptedProblemsCount
      
      // Update overall average using weighted average
      const previousAttemptedCount = stats.totalProblems - validatedTotalProblems
      const previousTotalTime = stats.totalTime - totalTimeFromProblems
      const previousAvgTime = previousAttemptedCount > 0 ? previousTotalTime / previousAttemptedCount : 0
      
      // Weighted average: (oldAvg * oldCount + newAvg * newCount) / totalCount
      const totalAttempted = previousAttemptedCount + attemptedProblemsCount
      if (totalAttempted > 0) {
        stats.averageTime = ((previousAvgTime * previousAttemptedCount) + (sessionAvgTime * attemptedProblemsCount)) / totalAttempted
        stats.averageTime = Math.round(stats.averageTime * 100) / 100
      }
    }

    const diffKey = difficulty || 'easy';
    // Category for Home-page breakdown: use category if provided, else derive from mode (frontend sends category)
    const categoryKey = category || diffKey;
    const validCategories = ['easy', 'medium', 'hard', 'custom', 'addition', 'division', 'multiplication', '2digit-mult'];
    const catKey = validCategories.includes(categoryKey) ? categoryKey : diffKey;

    // Ensure difficulty stats exist
    if (!stats.difficultyStats) {
      stats.difficultyStats = {
        easy: { problems: 0, correct: 0 },
        medium: { problems: 0, correct: 0 },
        hard: { problems: 0, correct: 0 },
        custom: { problems: 0, correct: 0 },
      }
    }
    if (!stats.difficultyStats[diffKey]) {
      stats.difficultyStats[diffKey] = { problems: 0, correct: 0 }
    }

    // Update difficulty stats - use validated values
    stats.difficultyStats[diffKey].problems += validatedTotalProblems
    stats.difficultyStats[diffKey].correct += validatedScore

    // Update highest score for this difficulty
    if (!stats.highestScoreByDifficulty) {
      stats.highestScoreByDifficulty = { easy: 0, medium: 0, hard: 0, custom: 0 };
    }
    if (validatedScore > (stats.highestScoreByDifficulty[diffKey] || 0)) {
      stats.highestScoreByDifficulty[diffKey] = validatedScore;
      console.log(`🏆 New high score for ${diffKey}: ${validatedScore}`)
    }

    // Update average score for this difficulty (based on sessions, not problems)
    if (!stats.averageScoreByDifficulty) {
      stats.averageScoreByDifficulty = { easy: 0, medium: 0, hard: 0, custom: 0 };
    }
    if (!stats.sessionCountByDifficulty) {
      stats.sessionCountByDifficulty = { easy: 0, medium: 0, hard: 0, custom: 0 };
    }
    
    // Count sessions for this difficulty
    const sessionCount = (stats.sessionCountByDifficulty[diffKey] || 0) + 1;
    stats.sessionCountByDifficulty[diffKey] = sessionCount;
    
    // Calculate running average: (oldAverage * (count-1) + newScore) / count
    const oldAverage = stats.averageScoreByDifficulty[diffKey] || 0;
    const newAverage = (oldAverage * (sessionCount - 1) + validatedScore) / sessionCount;
    stats.averageScoreByDifficulty[diffKey] = Math.round(newAverage * 100) / 100;

    // Update category stats (for Home-page categories: easy, medium, hard, addition, etc.)
    if (!stats.categoryStats) stats.categoryStats = new Map();
    const existingCat = stats.categoryStats.get(catKey) || { problems: 0, correct: 0, highScore: 0, avgScore: 0, sessionCount: 0 };
    const catSessionCount = existingCat.sessionCount + 1;
    const catAvgScore = (existingCat.avgScore * (catSessionCount - 1) + validatedScore) / catSessionCount;
    const catHighScore = Math.max(existingCat.highScore || 0, validatedScore);
    stats.categoryStats.set(catKey, {
      problems: (existingCat.problems || 0) + validatedTotalProblems,
      correct: (existingCat.correct || 0) + validatedScore,
      highScore: catHighScore,
      avgScore: Math.round(catAvgScore * 100) / 100,
      sessionCount: catSessionCount,
    });

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

    // Process per-problem stats - use validated problems array
    if (validatedProblems.length > 0) {
      console.log(`📝 Processing ${validatedProblems.length} problems for stats`)
      validatedProblems.forEach((p, index) => {
        try {
          const op = p.operator || '';
          const a = Number(p.a || 0);
          const b = Number(p.b || 0);
          const correct = !!p.correct && !!p.attempted; // only count attempted problems
          const timeMs = Math.max(0, Number(p.timeTaken || 0));
          
          // Skip if timeMs is invalid
          if (isNaN(timeMs) || timeMs < 0) {
            console.warn('⚠️ Invalid timeMs for problem:', p, 'skipping time tracking')
            return
          }

          const opKey = getOperationKey(op);
          const digitCat = getDigitCategory(a, b, op);
          const combinedKey = `${opKey}_${digitCat}`;

          // Update operation stats
          updateStatAggregate(stats.operationStats, opKey, correct, timeMs);

          // Update digit category stats
          updateStatAggregate(stats.digitCategoryStats, digitCat, correct, timeMs);

          // Update combined category stats (Map) - only count attempted with valid time
          const existing = stats.combinedCategoryStats.get(combinedKey) || {
            attempts: 0,
            correct: 0,
            avgTime: 0,
            totalTime: 0,
            timeCount: 0,
          };
          // Ensure all fields are valid numbers
          const existingAttempts = Number(existing.attempts || 0) || 0;
          const existingCorrect = Number(existing.correct || 0) || 0;
          const existingTotalTime = Number(existing.totalTime || 0) || 0;
          const existingTimeCount = Number(existing.timeCount || 0) || 0;
          
          // Convert and validate time
          const timeSeconds = Number(timeMs || 0) / 1000;
          const hasValidTime = !isNaN(timeSeconds) && timeSeconds > 0 && timeMs > 0;
          
          const newAttempts = existingAttempts + 1;
          const newCorrect = existingCorrect + (correct ? 1 : 0);
          
          let newTotalTime = existingTotalTime;
          let newTimeCount = existingTimeCount;
          
          if (hasValidTime) {
            newTotalTime = existingTotalTime + timeSeconds;
            newTimeCount = existingTimeCount + 1;
          }
          
          const newAvgTime = newTimeCount > 0 
            ? Math.round((newTotalTime / newTimeCount) * 100) / 100 
            : 0;

          stats.combinedCategoryStats.set(combinedKey, {
            attempts: newAttempts,
            correct: newCorrect,
            avgTime: isNaN(newAvgTime) ? 0 : newAvgTime,
            totalTime: isNaN(newTotalTime) ? 0 : newTotalTime,
            timeCount: newTimeCount,
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

    // Clean up any NaN values in nested objects before saving
    const cleanNumber = (val) => {
      if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) {
        return 0;
      }
      return val;
    };

    // Clean operation stats
    if (stats.operationStats) {
      Object.keys(stats.operationStats).forEach(key => {
        if (stats.operationStats[key]) {
          stats.operationStats[key].avgTime = cleanNumber(stats.operationStats[key].avgTime);
          stats.operationStats[key].totalTime = cleanNumber(stats.operationStats[key].totalTime);
          stats.operationStats[key].timeCount = cleanNumber(stats.operationStats[key].timeCount);
        }
      });
    }

    // Clean digit category stats
    if (stats.digitCategoryStats) {
      Object.keys(stats.digitCategoryStats).forEach(key => {
        if (stats.digitCategoryStats[key]) {
          stats.digitCategoryStats[key].avgTime = cleanNumber(stats.digitCategoryStats[key].avgTime);
          stats.digitCategoryStats[key].totalTime = cleanNumber(stats.digitCategoryStats[key].totalTime);
          stats.digitCategoryStats[key].timeCount = cleanNumber(stats.digitCategoryStats[key].timeCount);
        }
      });
    }

    // Clean combined category stats (Map)
    if (stats.combinedCategoryStats) {
      stats.combinedCategoryStats.forEach((value, key) => {
        if (value && typeof value === 'object') {
          stats.combinedCategoryStats.set(key, {
            attempts: cleanNumber(value.attempts),
            correct: cleanNumber(value.correct),
            avgTime: cleanNumber(value.avgTime),
            totalTime: cleanNumber(value.totalTime),
            timeCount: cleanNumber(value.timeCount),
          });
        }
      });
    }

    await stats.save();

    console.log('✅ Session saved. Updated stats:', {
      totalProblems: stats.totalProblems,
      correctAnswers: stats.correctAnswers,
      difficulty: stats.difficultyStats[diffKey],
    });

    res.json({
      message: 'Session saved successfully',
      stats: {
        totalProblems: stats.totalProblems,
        correctAnswers: stats.correctAnswers,
        currentStreak: stats.currentStreak,
      },
    });
  } catch (error) {
    console.error('❌ Save session error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error saving session',
      error: error.message 
    });
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
    stats.sessionCountByDifficulty = { easy: 0, medium: 0, hard: 0, custom: 0 };
    stats.categoryStats = new Map();
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
