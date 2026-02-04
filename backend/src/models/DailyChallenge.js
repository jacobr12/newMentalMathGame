import mongoose from 'mongoose';

const CHALLENGE_TYPES = ['division', 'equation', 'multiplication'];

const dailyChallengeSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: CHALLENGE_TYPES,
    required: true,
    default: 'division',
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

// One submission per user per day per challenge type
dailyChallengeSchema.index({ date: 1, user: 1, type: 1 }, { unique: true });

const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);
export { CHALLENGE_TYPES };

export default DailyChallenge;
