
import mongoose from "mongoose";
import "dotenv/config";
import User from "../src/models/User.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: node scripts/make-admin.js your-email@example.com");
  process.exitCode = 1;
} else {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ email });

    if (!user) {
      console.error("User not found. Register this email first.");
      process.exitCode = 1;
    } else {
      user.role = "admin";
      await user.save();
      console.log(`Admin role assigned to: ${user.email}`);
    }
  } catch (error) {
    console.error("Admin promotion failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
