
import User from "../../models/User.js";
import Charity from "../charities/charity.model.js";
import Draw from "../draws/draw.model.js";
import Winner from "../winners/winner.model.js";
import Contribution from "../subscriptions/contribution.model.js";

export async function getAdminOverview(req, res, next) {
  try {
    const [
      totalUsers,
      totalCharities,
      totalDraws,
      totalWinners,
      totalContributions,
      paidContributions,
    ] = await Promise.all([
      User.countDocuments(),
      Charity.countDocuments(),
      Draw.countDocuments(),
      Winner.countDocuments(),
      Contribution.countDocuments(),
      Contribution.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$contributionAmount" },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCharities,
        totalDraws,
        totalWinners,
        totalContributions,
        totalPaidContributions: paidContributions[0]?.total ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminUsers(req, res, next) {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminCharities(req, res, next) {
  try {
    const charities = await Charity.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: { charities },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminDraws(req, res, next) {
  try {
    const draws = await Draw.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: { draws },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminContributions(req, res, next) {
  try {
    const contributions = await Contribution.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "name email")
      .populate("charity", "name")
      .lean();

    res.json({
      success: true,
      data: { contributions },
    });
  } catch (error) {
    next(error);
  }
}
