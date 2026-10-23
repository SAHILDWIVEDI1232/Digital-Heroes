
import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
      index: true,
    },

    matchedNumbers: {
      type: [Number],
      default: [],
      validate: {
        validator(numbers) {
          return (
            numbers.length <= 5 &&
            numbers.every(
              (number) =>
                Number.isInteger(number) &&
                number >= 1 &&
                number <= 45
            ) &&
            new Set(numbers).size === numbers.length
          );
        },
        message: "Matched numbers must be unique numbers from 1 to 45",
      },
    },

    matchCount: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    prizeTier: {
      type: String,
      enum: [
        "none",
        "three_matches",
        "four_matches",
        "five_matches",
      ],
      default: "none",
    },

    prizeAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    proofImageUrl: {
      type: String,
      trim: true,
      default: null,
    },

    claimStatus: {
      type: String,
      enum: [
        "not_submitted",
        "pending_review",
        "approved",
        "rejected",
      ],
      default: "not_submitted",
    },

    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate winner records for the same user and draw.
winnerSchema.index(
  { user: 1, draw: 1 },
  { unique: true }
);

// Help query winners by draw and match count.
winnerSchema.index({ draw: 1, matchCount: -1 });

const Winner = mongoose.model("Winner", winnerSchema);

export default Winner;
