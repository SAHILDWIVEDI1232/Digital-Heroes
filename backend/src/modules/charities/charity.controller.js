
import mongoose from "mongoose";
import Charity from "./charity.model.js";
import ApiError from "../../utils/ApiError.js";

const makeSlug = (name) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const publicFields = "-__v";

// GET /api/charities
export const getCharities = async (req, res, next) => {
  try {
    const { search, category, featured, page, limit } =
      req.validated.query;

    const filter = { isActive: true };

    if (category) {
      filter.category = new RegExp(
        `^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i"
      );
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === "true";
    }

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { category: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const [charities, total] = await Promise.all([
      Charity.find(filter, publicFields)
        .sort({ isFeatured: -1, name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Charity.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: charities,
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

// GET /api/charities/:id
export const getCharityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid charity ID");
    }

    const charity = await Charity.findOne({
      _id: id,
      isActive: true,
    }).select(publicFields);

    if (!charity) {
      throw new ApiError(404, "Charity not found");
    }

    res.status(200).json({
      success: true,
      data: charity,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/charities — admin only
export const createCharity = async (req, res, next) => {
  try {
    const { name, ...otherFields } = req.validated.body;
    const baseSlug = makeSlug(name);

    if (!baseSlug) {
      throw new ApiError(400, "Charity name must contain letters or numbers");
    }

    const existing = await Charity.findOne({ slug: baseSlug });

    if (existing) {
      throw new ApiError(409, "A charity with this name already exists");
    }

    const charity = await Charity.create({
      name,
      ...otherFields,
      slug: baseSlug,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Charity created successfully",
      data: charity,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "A charity with this name already exists"));
    }
    next(error);
  }
};

// PATCH /api/charities/:id — admin only
export const updateCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.validated.params.id);

    if (!charity) {
      throw new ApiError(404, "Charity not found");
    }

    const updates = { ...req.validated.body };

    if (updates.name !== undefined) {
      const newSlug = makeSlug(updates.name);

      if (!newSlug) {
        throw new ApiError(400, "Invalid charity name");
      }

      const duplicate = await Charity.findOne({
        slug: newSlug,
        _id: { $ne: charity._id },
      });

      if (duplicate) {
        throw new ApiError(409, "A charity with this name already exists");
      }

      updates.slug = newSlug;
    }

    Object.assign(charity, updates);
    await charity.save();

    res.status(200).json({
      success: true,
      message: "Charity updated successfully",
      data: charity,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "A charity with this name already exists"));
    }
    next(error);
  }
};

// DELETE /api/charities/:id — admin only
// Soft delete preserves historical references.
export const deleteCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndUpdate(
      req.validated.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!charity) {
      throw new ApiError(404, "Charity not found");
    }

    res.status(200).json({
      success: true,
      message: "Charity deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};
