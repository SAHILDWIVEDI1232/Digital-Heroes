
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import scoreRoutes from "./modules/scores/score.routes.js";
import charityRoutes from "./modules/charities/charity.routes.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";
import { stripeWebhook } from "./modules/subscriptions/subscription.controller.js";
import drawRoutes from "./modules/draws/draw.routes.js";
import winnerRoutes from "./modules/winners/winner.routes.js";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import contributionRoutes from "./modules/subscriptions/contribution.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
const app = express();

app.use(helmet());


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://digital-heroes-one-opal.vercel.app",
    ],
    credentials: true,
  })
);


app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Digital Heroes API is running",
  });
});

// IMPORTANT: Stripe webhook must receive the untouched raw body.
app.post(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Parse JSON only after the webhook route.
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
