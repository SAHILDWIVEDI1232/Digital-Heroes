
import ApiError from "../../utils/ApiError.js";

const PRIZE_DISTRIBUTION = {
  five_matches: 0.40,
  four_matches: 0.35,
  three_matches: 0.25,
};

// All amounts passed to this service must be in the same currency unit.
export const calculatePrizePool = ({
  activeSubscribers,
  contributionPerSubscriber,
  previousJackpot = 0,
}) => {
  if (!Number.isInteger(activeSubscribers) || activeSubscribers < 0) {
    throw new ApiError(400, "Invalid active subscriber count");
  }

  if (
    !Number.isFinite(contributionPerSubscriber) ||
    contributionPerSubscriber < 0
  ) {
    throw new ApiError(400, "Invalid contribution amount");
  }

  if (!Number.isFinite(previousJackpot) || previousJackpot < 0) {
    throw new ApiError(400, "Invalid previous jackpot");
  }

  const currentPool = Number(
    (activeSubscribers * contributionPerSubscriber).toFixed(2)
  );

  const fiveMatchPool = Number(
    (currentPool * PRIZE_DISTRIBUTION.five_matches + previousJackpot).toFixed(2)
  );

  const fourMatchPool = Number(
    (currentPool * PRIZE_DISTRIBUTION.four_matches).toFixed(2)
  );

  const threeMatchPool = Number(
    (currentPool * PRIZE_DISTRIBUTION.three_matches).toFixed(2)
  );

  return {
    currentPool,
    prizeTiers: {
      five_matches: fiveMatchPool,
      four_matches: fourMatchPool,
      three_matches: threeMatchPool,
    },
    // This is the available five-match tier, not automatically the
    // next rollover. Final rollover depends on whether that tier has winners.
    fiveMatchPool,
  };
};

export const splitPrizeAmongWinners = (tierPool, winnerCount) => {
  if (!Number.isFinite(tierPool) || tierPool < 0) {
    throw new ApiError(400, "Invalid tier prize pool");
  }

  if (!Number.isInteger(winnerCount) || winnerCount < 1) {
    throw new ApiError(400, "Winner count must be at least 1");
  }

  return Number((tierPool / winnerCount).toFixed(2));
};
