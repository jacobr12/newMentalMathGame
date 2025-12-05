import express from 'express';
import Stats from '../models/Stats.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

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

    res.json({
      totalProblems: stats.totalProblems,
      correctAnswers: stats.correctAnswers,
      accuracy,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      averageTime: stats.averageTime,
      difficultyStats: stats.difficultyStats,
      lastPlayedDate: stats.lastPlayedDate,
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
    } = req.body;

    let stats = await Stats.findOne({ user: req.user._id });

    if (!stats) {
      stats = await Stats.create({
        user: req.user._id,
      });
    }

    // Update stats
    stats.totalProblems += totalProblems || 0;
    stats.correctAnswers += score || 0;
    stats.totalTime += timeElapsed || 0;

    // Calculate average time
    if (stats.totalProblems > 0) {
      stats.averageTime = Math.round(
        stats.totalTime / stats.totalProblems
      );
    }

    // Update difficulty stats
    if (difficulty && difficulty !== 'custom') {
      stats.difficultyStats[difficulty].problems += totalProblems || 0;
      stats.difficultyStats[difficulty].correct += score || 0;
    } else if (difficulty === 'custom') {
      stats.difficultyStats.custom.problems += totalProblems || 0;
      stats.difficultyStats.custom.correct += score || 0;
    }

    // Update streak (simplified - you might want to check dates)
    const today = new Date();
    const lastPlayed = new Date(stats.lastPlayedDate);
    const daysDiff = Math.floor(
      (today - lastPlayed) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day - continue streak
      // Streak logic can be enhanced
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
      difficulty: difficulty || 'easy',
      operations: operations || [],
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
// @desc    Reset user statistics (optional - for testing)
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
    stats.sessions = [];
    stats.difficultyStats = {
      easy: { problems: 0, correct: 0 },
      medium: { problems: 0, correct: 0 },
      hard: { problems: 0, correct: 0 },
      custom: { problems: 0, correct: 0 },
    };

    await stats.save();

    res.json({ message: 'Stats reset successfully' });
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({ message: 'Server error resetting stats' });
  }
});

export default router;
