export const dynamic = 'force-dynamic';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please set MONGODB_URI in .env.local');
}

let cached: any = (global as any).mongoose;
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: 'plantcare' })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}