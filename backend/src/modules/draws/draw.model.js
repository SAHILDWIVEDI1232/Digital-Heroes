
import mongoose from "mongoose";

const drawSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: [true, "Draw month is required"],
      unique: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM"],
    },

    winningNumbers: {
      type: [Number],
      default: [],
      validate: {
        validator(numbers) {
          return (
            numbers.length === 0 ||
            (numbers.length === 5 &&
              numbers.every(
                (number) =>
                  Number.isInteger(number) &&
                  number >= 1 &&
                  number <= 45
              ) &&
              new Set(numbers).size === 5)
          );
        },
        message: "Winning numbers must be 5 unique numbers from 1 to 45",
      },
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    prizePool: {
      type: Number,
      min: 0,
      default: 0,
    },

    jackpotRollover: {
      type: Number,
      min: 0,
      default: 0,
    },

    simulation: {
      simulated: {
        type: Boolean,
        default: false,
      },
      simulatedAt: {
        type: Date,
        default: null,
      },
      matchCounts: {
        threeMatches: { type: Number, default: 0 },
        fourMatches: { type: Number, default: 0 },
        fiveMatches: { type: Number, default: 0 },
      },
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Draw = mongoose.model("Draw", drawSchema);

export default Draw;
