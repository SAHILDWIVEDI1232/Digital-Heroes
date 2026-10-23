
import ApiError from "../../utils/ApiError.js";

export const calculateCharityContribution = ({
  subscriptionAmount,
  charityPercentage = 10,
}) => {
  if (
    !Number.isFinite(subscriptionAmount) ||
    subscriptionAmount <= 0
  ) {
    throw new ApiError(400, "Invalid subscription amount");
  }

  if (
    !Number.isFinite(charityPercentage) ||
    charityPercentage < 10 ||
    charityPercentage > 100
  ) {
    throw new ApiError(
      400,
      "Charity contribution must be between 10% and 100%"
    );
  }

  const charityAmount =
    (subscriptionAmount * charityPercentage) / 100;

  return {
    subscriptionAmount: Number(subscriptionAmount.toFixed(2)),
    charityPercentage,
    charityAmount: Number(charityAmount.toFixed(2)),
    remainingAmount: Number(
      (subscriptionAmount - charityAmount).toFixed(2)
    ),
  };
};
