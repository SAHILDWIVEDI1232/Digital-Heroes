import app from "./app.js";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Server running at http://localhost:${env.PORT}`);
  });

  const shutdown = () => {
    server.close(async () => {
      const mongoose = await import("mongoose");
      await mongoose.default.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});