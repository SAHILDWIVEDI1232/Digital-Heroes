
import mongoose from "mongoose";
import Winner from "./winner.model.js";
import ApiError from "../../utils/ApiError.js";
import Draw from "../draws/draw.model.js";
import { calculateMatches } from "./winner.service.js";
import Score from "../scores/score.model.js";
import UserSubscription from "../subscriptions/subscription.model.js";

export const getMyWinners = async (req, res, next) => {
  try {
    const winners = await Winner.find({ user: req.user._id })
      .populate("draw", "month winningNumbers status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: winners,
    });
  } catch (error) {
    next(error);
  }
};

export const submitProof = async (req, res, next) => {
  try {
    const winner = await Winner.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!winner) {
      throw new ApiError(404, "Winner record not found");
    }

    if (winner.matchCount < 3) {
      throw new ApiError(400, "This record is not eligible for a prize claim");
    }

    if (winner.claimStatus === "approved") {
      throw new ApiError(400, "This claim has already been approved");
    }

    if (winner.payoutStatus === "paid") {
      throw new ApiError(400, "This prize has already been paid");
    }

    winner.proofImageUrl = req.validated.body.proofImageUrl;
    winner.claimStatus = "pending_review";
    winner.reviewedBy = null;
    winner.reviewedAt = null;

    await winner.save();

    res.json({
      success: true,
      message: "Proof submitted for admin review",
      data: winner,
    });
  } catch (error) {
    next(error);
  }
};

export const listWinners = async (req, res, next) => {
  try {
    const page = Number(req.validated?.query?.page ?? 1);
    const limit = Number(req.validated?.query?.limit ?? 20);

    const [winners, total] = await Promise.all([
      Winner.find()
        .populate("user", "name email")
        .populate("draw", "month winningNumbers status")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Winner.countDocuments(),
    ]);

    res.json({
      success: true,
      data: winners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getWinnerById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid winner ID");
    }

    const winner = await Winner.findById(req.params.id)
      .populate("user", "name email")
      .populate("draw", "month winningNumbers status");

    if (!winner) {
      throw new ApiError(404, "Winner record not found");
    }

    res.json({
      success: true,
      data: winner,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewClaim = async (req, res, next) => {
  try {
    const winner = await Winner.findById(req.params.id);

    if (!winner) {
      throw new ApiError(404, "Winner record not found");
    }

    if (winner.claimStatus !== "pending_review") {
      throw new ApiError(400, "Claim is not awaiting review");
    }

    if (!winner.proofImageUrl) {
      throw new ApiError(400, "Proof must be submitted before review");
    }

    winner.claimStatus = req.validated.body.claimStatus;
    winner.reviewedBy = req.user._id;
    winner.reviewedAt = new Date();

    await winner.save();

    res.json({
      success: true,
      message: `Claim ${winner.claimStatus}`,
      data: winner,
    });
  } catch (error) {
    next(error);
  }
};

export const markPayoutPaid = async (req, res, next) => {
  try {
    const winner = await Winner.findById(req.params.id);

    if (!winner) {
      throw new ApiError(404, "Winner record not found");
    }

    if (winner.claimStatus !== "approved") {
      throw new ApiError(400, "Claim must be approved before payout");
    }

    if (winner.prizeAmount <= 0) {
      throw new ApiError(400, "A valid prize amount must be set before payout");
    }

    if (winner.payoutStatus === "paid") {
      throw new ApiError(400, "Payout is already marked as paid");
    }

    winner.payoutStatus = "paid";
    winner.paidAt = new Date();

    await winner.save();

    res.json({
      success: true,
      message: "Payout marked as paid",
      data: winner,
    });
  } catch (error) {
    next(error);
  }
};
export const setPrizeAmount = async (req, res, next) => {
  try {
    const winner = await Winner.findById(req.params.id);

    if (!winner) {
      throw new ApiError(404, "Winner record not found");
    }

    if (winner.payoutStatus === "paid") {
      throw new ApiError(400, "Paid prize amount cannot be changed");
    }

    if (winner.claimStatus !== "approved") {
      throw new ApiError(400, "Approve the claim before setting the prize amount");
    }

    winner.prizeAmount = req.validated.body.prizeAmount;
    await winner.save();

    res.json({
      success: true,
      message: "Prize amount updated",
      data: winner,
    });
  } catch (error) {
    next(error);
  }
};

// export const calculateWinnerForUser = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId, entryNumbers } = req.validated.body;

//     const draw = await Draw.findById(id);

//     if (!draw) {
//       throw new ApiError(404, "Draw not found");
//     }

//     if (draw.status !== "published") {
//       throw new ApiError(400, "Only published draws can be checked");
//     }

//     const result = calculateMatches(
//       entryNumbers,
//       draw.winningNumbers
//     );

//     res.json({
//       success: true,
//       message: "Entry matching calculated; no winner record was created",
//       data: {
//         userId,
//         drawId: draw._id,
//         ...result,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const calculateWinnerForUser = async (req, res, next) => {
  try {
    const { id: drawId } = req.params;
    const { userId } = req.validated.body;

    const draw = await Draw.findById(drawId);

    if (!draw) {
      throw new ApiError(404, "Draw not found");
    }

    if (draw.status !== "published") {
      throw new ApiError(400, "Only published draws can be checked");
    }

    if (
      !Array.isArray(draw.winningNumbers) ||
      draw.winningNumbers.length !== 5
    ) {
      throw new ApiError(400, "Draw must have exactly 5 winning numbers");
    }

    // Fetch the user's latest 5 saved scores.
    const scores = await Score.find({ user: userId })
      .sort({ playedAt: -1, _id: -1 })
      .limit(5)
      .select("score playedAt");

    if (scores.length < 5) {
      throw new ApiError(
        400,
        "User must have at least 5 saved scores before checking the draw"
      );
    }

    // A repeated score value counts as one distinct entry number.
    const entryNumbers = [...new Set(scores.map((item) => item.score))];

    const result = calculateMatches(
      entryNumbers,
      draw.winningNumbers
    );

    // Never overwrite an existing claim or payout record.
    const existingWinner = await Winner.findOne({
      user: userId,
      draw: drawId,
    });

    if (existingWinner) {
      return res.json({
        success: true,
        message: "A winner record already exists for this user and draw",
        data: existingWinner,
      });
    }

    const winner = await Winner.create({
      user: userId,
      draw: drawId,
      matchedNumbers: result.matchedNumbers,
      matchCount: result.matchCount,
      prizeTier: result.prizeTier,
      prizeAmount: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Draw checked and winner record created",
      data: {
        ...winner.toObject(),
        entryNumbers,
        scoresUsed: scores.map((item) => ({
          score: item.score,
          playedAt: item.playedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const calculateWinnersForDraw = async (req, res, next) => {
  try {
    const { id: drawId } = req.params;

    const draw = await Draw.findById(drawId);

    if (!draw) {
      throw new ApiError(404, "Draw not found");
    }

    if (draw.status !== "published") {
      throw new ApiError(400, "Only published draws can be checked");
    }

    // Only active subscriptions are eligible for this initial pass.
    const subscriptions = await UserSubscription.find({
      status: "active",
      currentPeriodEnd: { $gt: new Date() },
    }).select("user");

    const userIds = [
      ...new Set(subscriptions.map((subscription) =>
        subscription.user.toString()
      )),
    ];

    const results = {
      checked: 0,
      created: 0,
      skipped: 0,
      errors: [],
    };

    for (const userId of userIds) {
      try {
        const scores = await Score.find({ user: userId })
          .sort({ playedAt: -1, _id: -1 })
          .limit(5)
          .select("score playedAt");

        if (scores.length < 5) {
          results.skipped++;
          continue;
        }

        const entryNumbers = [
          ...new Set(scores.map((item) => item.score)),
        ];

        const match = calculateMatches(
          entryNumbers,
          draw.winningNumbers
        );

        const existing = await Winner.findOne({
          user: userId,
          draw: drawId,
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await Winner.create({
          user: userId,
          draw: drawId,
          matchedNumbers: match.matchedNumbers,
          matchCount: match.matchCount,
          prizeTier: match.prizeTier,
          prizeAmount: 0,
        });

        results.created++;
        results.checked++;
      } catch (error) {
        results.errors.push({
          userId,
          message: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: "Bulk winner calculation finished",
      data: {
        eligibleSubscribers: userIds.length,
        ...results,
      },
    });
  } catch (error) {
    next(error);
  }
};

