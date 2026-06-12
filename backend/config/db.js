import mongoose from 'mongoose';
import env from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`===============================================`);
    console.log(` MongoDB connected to database: ${conn.connection.name}`);
    console.log(` Host: ${conn.connection.host}`);
    console.log(`===============================================`);
  } catch (error) {
    console.error(`ERROR connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
