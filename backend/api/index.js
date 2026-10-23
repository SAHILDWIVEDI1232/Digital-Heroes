
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Backend initialization failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Backend initialization failed",
    });
  }
}
