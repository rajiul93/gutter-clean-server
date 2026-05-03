import mongoose from 'mongoose';
import config from '../config';

/**
 * Reuse one in-flight connect promise per serverless instance (Vercel) or Node process.
 * Without this, importing `app` without running `server.ts` never calls `mongoose.connect`,
 * and operations buffer until they time out.
 */
const globalWithMongo = globalThis as typeof globalThis & {
  __mongooseConnectPromise?: Promise<void> | null;
};

export async function connectDB(): Promise<void> {
  if (!config.database_url) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your environment (e.g. Vercel → Settings → Environment Variables).',
    );
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!globalWithMongo.__mongooseConnectPromise) {
    globalWithMongo.__mongooseConnectPromise = mongoose
      .connect(config.database_url, {
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 10,
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        globalWithMongo.__mongooseConnectPromise = null;
        throw err;
      });
  }

  await globalWithMongo.__mongooseConnectPromise;
}
