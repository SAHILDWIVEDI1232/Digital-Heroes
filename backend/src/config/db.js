import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}