
import Charity from "../charities/charity.model.js";
import ApiError from "../../utils/ApiError.js";

export async function createCharity(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name?.trim() || !description?.trim()) {
      throw new ApiError(400, "Name and description are required");
    }

    const charity = await Charity.create({
      name: name.trim(),
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      data: { charity },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCharity(req, res, next) {
  try {
    const { name, description } = req.body;
    const updates = {};

    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    if (typeof description === "string" && description.trim()) {
      updates.description = description.trim();
    }

    if (!Object.keys(updates).length) {
      throw new ApiError(400, "Provide a valid name or description");
    }

    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!charity) throw new ApiError(404, "Charity not found");

    res.json({ success: true, data: { charity } });
  } catch (error) {
    next(error);
  }
}

export async function deleteCharity(req, res, next) {
  try {
    const charity = await Charity.findByIdAndDelete(req.params.id);

    if (!charity) throw new ApiError(404, "Charity not found");

    res.json({
      success: true,
      message: "Charity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
