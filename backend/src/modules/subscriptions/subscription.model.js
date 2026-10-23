
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    selectedCharity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      default: null,
    },
    charityPercentage: {
      type: Number,
      min: 10,
      max: 100,
      default: 10,
    },
    charityContributionAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    checkoutSessionId: {
      type: String,
      default: null,
    },
    stripePriceId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "incomplete",
        "incomplete_expired",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "paused",
      ],
      default: "incomplete",
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserSubscription = mongoose.model(
  "UserSubscription",
  subscriptionSchema
);

export default UserSubscription;
