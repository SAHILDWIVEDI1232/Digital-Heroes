
import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSubscription",
      required: true,
      index: true,
    },
    charity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      required: true,
      index: true,
    },
    stripeInvoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
    },
    subscriptionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    charityPercentage: {
      type: Number,
      required: true,
      min: 10,
      max: 100,
    },
    contributionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

contributionSchema.index({ user: 1, createdAt: -1 });
contributionSchema.index({ charity: 1, status: 1 });

const Contribution = mongoose.model(
  "Contribution",
  contributionSchema
);

export default Contribution;
