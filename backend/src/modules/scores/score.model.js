import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 45,
    },
    playedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Ek user ka ek calendar date par ek hi score.
scoreSchema.index({ user: 1, playedAt: 1 }, { unique: true });

const Score = mongoose.model("Score", scoreSchema);

export default Score;