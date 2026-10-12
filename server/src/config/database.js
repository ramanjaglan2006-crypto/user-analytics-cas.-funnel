import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

/**
 * Connect to MongoDB with graceful fallback to MongoMemoryServer for development/testing
 * when local MongoDB daemon is not running.
 */
export async function connectDB(customUri = null) {
  const uri = customUri || process.env.MONGODB_URI;

  // If a custom URI is explicitly provided (such as in tests), connect to it
  if (customUri) {
    try {
      await mongoose.connect(customUri);
      console.log(`[Database] Connected successfully to custom MongoDB URI.`);
      return mongoose.connection;
    } catch (err) {
      console.error(`[Database] Failed to connect to custom MongoDB URI:`, err.message);
      throw err;
    }
  }

  // Attempt to connect to configured MONGODB_URI if provided and not explicitly "embedded"
  if (uri && uri !== 'embedded') {
    try {
      console.log(`[Database] Attempting to connect to ${uri}...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000, // Quick timeout for fast fallback
      });
      console.log(`[Database] Connected to external MongoDB at ${uri}`);
      return mongoose.connection;
    } catch (err) {
      console.warn(`[Database] Could not connect to external MongoDB (${err.message}).`);
      console.log(`[Database] Starting embedded MongoDB instance for seamless local execution...`);
    }
  }

  // Start embedded MongoMemoryServer
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to embedded MongoDB instance at ${memoryUri}`);
    return mongoose.connection;
  } catch (err) {
    console.error(`[Database] Failed to initialize embedded MongoDB:`, err.message);
    throw err;
  }
}

/**
 * Disconnect from MongoDB and stop memory server if running.
 */
export async function disconnectDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('[Database] Disconnected from MongoDB.');
  } catch (err) {
    console.error('[Database] Error disconnecting:', err.message);
  }
}
