
// backend/src/modules/subscriptions/contribution.controller.js

import Contribution from "./contribution.model.js";

export const getMyContributions = async (req, res, next) => {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const filter = { user: req.user._id };

    const [contributions, total] = await Promise.all([
      Contribution.find(filter)
        .populate("charity", "name slug imageUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Contribution.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        contributions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getContributionSummary = async (
  req,
  res,
  next
) => {
  try {
    const [overall, byCharity, recentContributions] =
      await Promise.all([
        Contribution.aggregate([
          {
            $match: { status: "paid" },
          },
          {
            $group: {
              _id: "$currency",
              totalContributions: {
                $sum: "$contributionAmount",
              },
              totalSubscriptionAmount: {
                $sum: "$subscriptionAmount",
              },
              contributionCount: {
                $sum: 1,
              },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]),

        Contribution.aggregate([
          {
            $match: { status: "paid" },
          },
          {
            $group: {
              _id: {
                charity: "$charity",
                currency: "$currency",
              },
              totalContributions: {
                $sum: "$contributionAmount",
              },
              contributionCount: {
                $sum: 1,
              },
            },
          },
          {
            $lookup: {
              from: "charities",
              localField: "_id.charity",
              foreignField: "_id",
              as: "charity",
            },
          },
          {
            $unwind: {
              path: "$charity",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 0,
              charityId: "$_id.charity",
              charityName: {
                $ifNull: ["$charity.name", "Unknown charity"],
              },
              currency: "$_id.currency",
              totalContributions: 1,
              contributionCount: 1,
            },
          },
          {
            $sort: { totalContributions: -1 },
          },
        ]),

        Contribution.find({ status: "paid" })
          .populate("user", "name email")
          .populate("charity", "name slug")
          .sort({ paidAt: -1, createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    res.status(200).json({
      success: true,
      data: {
        overall,
        byCharity,
        recentContributions,
      },
    });
  } catch (error) {
    next(error);
  }
};
