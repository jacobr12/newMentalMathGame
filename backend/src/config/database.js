import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // One-time: drop old daily challenge unique index (date + user) so new index (date + user + type) applies
    try {
      const col = conn.connection.collection('dailychallenges');
      const indexes = await col.indexes();
      if (indexes.some((i) => i.name === 'date_1_user_1')) {
        await col.dropIndex('date_1_user_1');
        console.log('Dropped old daily challenge index date_1_user_1');
      }
    } catch (e) {
      // Ignore if collection doesn't exist or index already dropped
      if (e.code !== 27 && e.code !== 26) console.warn('Index migration:', e.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
