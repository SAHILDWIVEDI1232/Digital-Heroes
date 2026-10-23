import mongoose from "mongoose";
import Score from "./score.model.js";
import ApiError from "../../utils/ApiError.js";

const formatScore = (score) => ({
  id: score._id,
  score: score.score,
  playedAt: score.playedAt.toISOString().slice(0, 10),
  createdAt: score.createdAt,
  updatedAt: score.updatedAt,
});

// GET /api/scores
export const getScores = async (req, res, next) => {
  try {
    const scores = await Score.find({ user: req.user._id })
      .sort({ playedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: scores.map(formatScore),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/scores
export const createScore = async (req, res, next) => {
  try {
    const { score, playedAt } = req.validated.body;
    const date = new Date(`${playedAt}T00:00:00.000Z`);

    const existing = await Score.findOne({
      user: req.user._id,
      playedAt: date,
    });

    if (existing) {
      throw new ApiError(409, "A score already exists for this date");
    }

    const newScore = await Score.create({
      user: req.user._id,
      score,
      playedAt: date,
    });

    // Latest 5 retain karo; purane records delete karo.
    const oldScores = await Score.find({ user: req.user._id })
      .sort({ playedAt: -1, createdAt: -1 })
      .skip(5)
      .select("_id");

    if (oldScores.length > 0) {
      await Score.deleteMany({
        _id: { $in: oldScores.map((item) => item._id) },
        user: req.user._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Score added successfully",
      data: formatScore(newScore),
    });
  } catch (error) {
    // Unique index race-condition protection.
    if (error.code === 11000) {
      return next(new ApiError(409, "A score already exists for this date"));
    }
    next(error);
  }
};

// PATCH /api/scores/:id
export const updateScore = async (req, res, next) => {
  try {
    const { id } = req.validated.params;
    const { score } = req.validated.body;

    const updatedScore = await Score.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: { score } },
      { new: true, runValidators: true }
    );

    if (!updatedScore) {
      throw new ApiError(404, "Score not found");
    }

    res.status(200).json({
      success: true,
      message: "Score updated successfully",
      data: formatScore(updatedScore),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/scores/:id
export const deleteScore = async (req, res, next) => {
  try {
    const { id } = req.validated.params;

    const deletedScore = await Score.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deletedScore) {
      throw new ApiError(404, "Score not found");
    }

    res.status(200).json({
      success: true,
      message: "Score deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};