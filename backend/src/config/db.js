import mongoose from 'mongoose';

let mongod = null;

export const connectDB = async () => {
  // Reuse existing connection if already connected (vital for Vercel serverless)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  let uri = process.env.MONGO_URI;

  // On Vercel, MONGO_URI is required; do not attempt mongodb-memory-server
  if (!uri && !process.env.VERCEL) {
    console.log('⚡ No MONGO_URI specified. Starting embedded in-memory MongoDB for local dev...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(' Embedded MongoDB ready.');
    } catch (err) {
      console.error('Failed to start in-memory MongoDB:', err.message);
      throw err;
    }
  }

  if (!uri) {
    throw new Error('MONGO_URI environment variable is required in production / Vercel.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.VERCEL) {
      throw error;
    }

    // If external URI failed locally, try in-memory fallback
    if (!mongod) {
      console.log(' Falling back to embedded in-memory MongoDB...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const fallbackUri = mongod.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(` Fallback MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }
    throw error;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
