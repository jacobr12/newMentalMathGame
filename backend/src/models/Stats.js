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
