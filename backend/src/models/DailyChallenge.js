import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  answers: [
    {
      problemIndex: { type: Number },
      userAnswer: { type: Number },
      correctAnswer: { type: Number },
      timeTaken: { type: Number }, // ms
      problemScore: { type: Number },
    },
  ],
}, { timestamps: true });

// One best submission per user per day
dailyChallengeSchema.index({ date: 1, user: 1 }, { unique: true });

const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);

export default DailyChallenge;
