
import UserSubscription from "./subscription.model.js";
import Contribution from "./contribution.model.js";
import ApiError from "../../utils/ApiError.js";

export const recordPaidInvoiceContribution = async (invoice) => {
  const invoiceId = invoice.id;

  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ??
        invoice.parent?.subscription_details?.subscription ??
        null;

  if (!invoiceId || !subscriptionId) {
    throw new ApiError(
      400,
      "Invoice ID or subscription ID is missing"
    );
  }

  if (invoice.status !== "paid" && invoice.paid !== true) {
    throw new ApiError(400, "Invoice has not been paid");
  }

  const subscription = await UserSubscription.findOne({
    stripeSubscriptionId: subscriptionId,
  });

  if (!subscription) {
    throw new ApiError(
      404,
      "Local subscription record not found for paid invoice"
    );
  }

  if (!subscription.selectedCharity) {
    throw new ApiError(
      400,
      "No charity is associated with this subscription"
    );
  }

  const percentage = Number(subscription.charityPercentage ?? 10);
  const amountPaid = Number(invoice.amount_paid);

  if (
    !Number.isFinite(percentage) ||
    percentage < 10 ||
    percentage > 100
  ) {
    throw new ApiError(400, "Invalid charity percentage");
  }

  if (!Number.isSafeInteger(amountPaid) || amountPaid < 0) {
    throw new ApiError(400, "Invalid paid invoice amount");
  }

  const contributionAmount = Math.round(
    (amountPaid * percentage) / 100
  );

  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(invoice.status_transitions.paid_at * 1000)
    : new Date();

  const contribution = await Contribution.findOneAndUpdate(
    { stripeInvoiceId: invoiceId },
    {
      $setOnInsert: {
        user: subscription.user,
        subscription: subscription._id,
        charity: subscription.selectedCharity,
        stripeInvoiceId: invoiceId,
        currency: invoice.currency,
        subscriptionAmount: amountPaid,
        charityPercentage: percentage,
        contributionAmount,
        status: "paid",
        paidAt,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  return contribution;
};
