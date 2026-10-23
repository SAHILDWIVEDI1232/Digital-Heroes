
import mongoose from "mongoose";

const drawDistributionSchema = new mongoose.Schema(
  {
    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
      required: true,
    },
    currency: {
      type: String,
      lowercase: true,
      required: true,
    },
    currentPool: {
      type: Number,
      min: 0,
      required: true,
    },
    previousJackpot: {
      type: Number,
      min: 0,
      default: 0,
    },
    tierPools: {
      five_matches: { type: Number, min: 0, default: 0 },
      four_matches: { type: Number, min: 0, default: 0 },
      three_matches: { type: Number, min: 0, default: 0 },
    },
    winnerCounts: {
      five_matches: { type: Number, min: 0, default: 0 },
      four_matches: { type: Number, min: 0, default: 0 },
      three_matches: { type: Number, min: 0, default: 0 },
    },
    jackpotRollover: {
      type: Number,
      min: 0,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const DrawDistribution = mongoose.model(
  "DrawDistribution",
  drawDistributionSchema
);

export default DrawDistribution;
