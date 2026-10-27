import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('⚡ No MONGO_URI specified. Starting embedded in-memory MongoDB for local dev...');
    try {
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(' Embedded MongoDB ready.');
    } catch (err) {
      console.error('Failed to start in-memory MongoDB:', err.message);
      throw err;
    }
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // If external URI failed, try in-memory fallback
    if (process.env.MONGO_URI && !mongod) {
      console.log(' Falling back to embedded in-memory MongoDB...');
      mongod = await MongoMemoryServer.create();
      const fallbackUri = mongod.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(` Fallback MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
