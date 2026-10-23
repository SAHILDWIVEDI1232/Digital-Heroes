
import User from "../../models/User.js";
import Charity from "./charity.model.js";
import ApiError from "../../utils/ApiError.js";

export const getCharityPreference = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("selectedCharity charityPercentage")
      .populate("selectedCharity");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      data: {
        selectedCharity: user.selectedCharity,
        charityPercentage: user.charityPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCharityPreference = async (req, res, next) => {
  try {
    const { charityId, charityPercentage } = req.body;

    const charity = await Charity.findById(charityId);

    if (!charity) {
      throw new ApiError(404, "Charity not found");
    }

    const percentage = Number(charityPercentage);

    if (
      !Number.isFinite(percentage) ||
      percentage < 10 ||
      percentage > 100
    ) {
      throw new ApiError(
        400,
        "Charity percentage must be between 10 and 100"
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        selectedCharity: charity._id,
        charityPercentage: percentage,
      },
      { new: true, runValidators: true }
    ).select("selectedCharity charityPercentage");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      message: "Charity preference updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
