
import mongoose from "mongoose";
import Draw from "./draw.model.js";
import ApiError from "../../utils/ApiError.js";
import Winner from "../winners/winner.model.js";
import Contribution from "../subscriptions/contribution.model.js";
import DrawDistribution from "./drawDistribution.model.js";
import {
  calculatePrizePool,
  splitPrizeAmongWinners,
} from "./prizePool.service.js";

// GET /api/draws/published
// Logged-in players can see published results only.
export const listPublishedDraws = async (req, res, next) => {
  try {
    const draws = await Draw.find({ status: "published" })
      .select(
        "month winningNumbers status prizePool jackpotRollover publishedAt createdAt"
      )
      .sort({ month: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: draws,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/draws — admin only
export const listDraws = async (req, res, next) => {
  try {
    const draws = await Draw.find()
      .sort({ month: -1 })
      .lean();

    res.json({
      success: true,
      data: draws,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/draws — admin only
export const createDraw = async (req, res, next) => {
  try {
    const { month } = req.validated.body;

    const existing = await Draw.findOne({ month });

    if (existing) {
      throw new ApiError(409, "A draw already exists for this month");
    }

    const draw = await Draw.create({
      month,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: draw,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "A draw already exists for this month"));
    }

    next(error);
  }
};

// GET /api/draws/:id — admin only
export const getDraw = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid draw ID");
    }

    const draw = await Draw.findById(id);

    if (!draw) {
      throw new ApiError(404, "Draw not found");
    }

    res.json({
      success: true,
      data: draw,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/draws/:id/simulate — admin only
export const simulateDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      throw new ApiError(404, "Draw not found");
    }

    if (draw.status === "published") {
      throw new ApiError(400, "Published draws cannot be simulated again");
    }

    const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    draw.winningNumbers = numbers.slice(0, 5).sort((a, b) => a - b);
    draw.simulation.simulated = true;
    draw.simulation.simulatedAt = new Date();

    await draw.save();

    res.json({
      success: true,
      message: "Draw simulation completed",
      data: draw,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/draws/:id/publish — admin only
export const publishDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      throw new ApiError(404, "Draw not found");
    }

    if (draw.status === "published") {
      throw new ApiError(400, "Draw is already published");
    }

    if (
      !draw.simulation.simulated ||
      draw.winningNumbers.length !== 5
    ) {
      throw new ApiError(
        400,
        "Simulate the draw before publishing"
      );
    }

    draw.status = "published";
    draw.publishedAt = new Date();

    await draw.save();

    res.json({
      success: true,
      message: "Draw published successfully",
      data: draw,
    });
  } catch (error) {
    next(error);
  }
};

export const distributeDraw = async (req, res, next) => {
  let distribution;

  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      throw new ApiError(404, "Draw not found");
    }

    if (draw.status !== "published") {
      throw new ApiError(400, "Only published draws can be distributed");
    }

    if (!Number.isFinite(draw.prizePool) || draw.prizePool <= 0) {
      throw new ApiError(400, "Draw has no funded prize pool");
    }

    const existing = await DrawDistribution.findOne({
      draw: draw._id,
    });

    if (existing) {
      throw new ApiError(
        409,
        "Distribution already exists for this draw"
      );
    }

    const winners = await Winner.find({
      draw: draw._id,
      matchCount: { $gte: 3 },
    });

    const fiveWinners = winners.filter(
      (winner) => winner.matchCount === 5
    );
    const fourWinners = winners.filter(
      (winner) => winner.matchCount === 4
    );
    const threeWinners = winners.filter(
      (winner) => winner.matchCount === 3
    );

    const previousJackpot = Number(draw.jackpotRollover || 0);
    const pool = Number(draw.prizePool);

    const tierPools = {
      five_matches: Number((pool * 0.4 + previousJackpot).toFixed(2)),
      four_matches: Number((pool * 0.35).toFixed(2)),
      three_matches: Number((pool * 0.25).toFixed(2)),
    };

    const winnerCounts = {
      five_matches: fiveWinners.length,
      four_matches: fourWinners.length,
      three_matches: threeWinners.length,
    };

    const split = (amount, count) =>
      count > 0 ? Number((amount / count).toFixed(2)) : 0;

    const fivePrize = split(
      tierPools.five_matches,
      fiveWinners.length
    );
    const fourPrize = split(
      tierPools.four_matches,
      fourWinners.length
    );
    const threePrize = split(
      tierPools.three_matches,
      threeWinners.length
    );

    // Unclaimed tier funds roll into the next jackpot.
    const jackpotRollover = Number((
      (fiveWinners.length ? 0 : tierPools.five_matches) +
      (fourWinners.length ? 0 : tierPools.four_matches) +
      (threeWinners.length ? 0 : tierPools.three_matches)
    ).toFixed(2));

    distribution = await DrawDistribution.create({
      draw: draw._id,
      status: "processing",
      currency: process.env.STRIPE_CURRENCY || "usd",
      currentPool: pool,
      previousJackpot,
      tierPools,
      winnerCounts,
      jackpotRollover,
    });

    const updates = [
      ...fiveWinners.map((winner) => ({
        updateOne: {
          filter: { _id: winner._id, draw: draw._id },
          update: { $set: { prizeAmount: fivePrize } },
        },
      })),
      ...fourWinners.map((winner) => ({
        updateOne: {
          filter: { _id: winner._id, draw: draw._id },
          update: { $set: { prizeAmount: fourPrize } },
        },
      })),
      ...threeWinners.map((winner) => ({
        updateOne: {
          filter: { _id: winner._id, draw: draw._id },
          update: { $set: { prizeAmount: threePrize } },
        },
      })),
    ];

    if (updates.length) {
      await Winner.bulkWrite(updates);
    }

    draw.jackpotRollover = jackpotRollover;
    await draw.save();

    distribution.status = "completed";
    distribution.completedAt = new Date();
    await distribution.save();

    return res.status(200).json({
      success: true,
      message: "Prize distribution completed",
      data: {
        drawId: draw._id,
        currentPool: pool,
        tierPools,
        winnerCounts,
        jackpotRollover,
      },
    });
  } catch (error) {
    if (distribution) {
      try {
        distribution.status = "failed";
        await distribution.save();
      } catch {
        // Preserve the original error.
      }
    }

    if (error.code === 11000) {
      return next(
        new ApiError(409, "Distribution already exists for this draw")
      );
    }

    next(error);
  }
};

