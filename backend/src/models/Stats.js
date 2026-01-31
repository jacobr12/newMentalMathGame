import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalProblems: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  totalTime: {
    type: Number, // Total time spent in seconds
    default: 0,
  },
  averageTime: {
    type: Number, // Average time per problem in seconds
    default: 0,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastPlayedDate: {
    type: Date,
    default: Date.now,
  },
  sessions: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      score: {
        type: Number,
        default: 0,
      },
      timeLimit: {
        type: Number,
      },
      difficulty: {
        type: String,
      },
      operations: [String],
      problems: [
        {
          a: Number,
          b: Number,
          operator: String,
          correct: Boolean,
          attempted: Boolean,
          timeTaken: Number, // milliseconds
        },
      ],
    },
  ],
  difficultyStats: {
    easy: {
      problems: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
    },
    medium: {
      problems: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
    },
    hard: {
      problems: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
    },
    custom: {
      problems: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
    },
  },
  // Highest score achieved per difficulty
  highestScoreByDifficulty: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    custom: { type: Number, default: 0 },
  },
  // Average score per difficulty (total points / num sessions)
  averageScoreByDifficulty: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    custom: { type: Number, default: 0 },
  },
  // Stats by operation: add, sub, mul, div
  operationStats: {
    add: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      avgTime: { type: Number, default: 0 },
    },
    sub: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      avgTime: { type: Number, default: 0 },
    },
    mul: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      avgTime: { type: Number, default: 0 },
    },
    div: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      avgTime: { type: Number, default: 0 },
    },
  },
  // Stats by digit category: 1d, 2d, 3d+ (max digit count of operands)
  digitCategoryStats: {
    '1d': {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      avgTime: { type: Number, default: 0 },
    },
    '2d': {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      avgTime: { type: Number, default: 0 },
    },
    '3d+': {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      avgTime: { type: Number, default: 0 },
    },
  },
  // Combined category: operation + digit (e.g. add_1d, mul_3d+)
  combinedCategoryStats: {
    type: Map,
    of: new mongoose.Schema({
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      avgTime: { type: Number, default: 0 },
    }, { _id: false }),
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
statsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Stats = mongoose.model('Stats', statsSchema);

export default Stats;
