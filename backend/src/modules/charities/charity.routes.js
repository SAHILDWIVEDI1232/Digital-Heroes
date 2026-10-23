
import { Router } from "express";

import { protect, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
  getCharities,
  getCharityById,
  createCharity,
  updateCharity,
  deleteCharity,
} from "./charity.controller.js";

import {
  createCharitySchema,
  updateCharitySchema,
  charityIdSchema,
  listCharitiesSchema,
} from "./charity.validation.js";

import {
  getCharityPreference,
  updateCharityPreference,
} from "./charityPreference.controller.js";

import {
  updateCharityPreferenceSchema,
} from "./charityPreference.validation.js";

const router = Router();

// Public directory
router.get("/", validate(listCharitiesSchema), getCharities);

// User charity preference — keep before /:id
router.get("/preference", protect, getCharityPreference);

router.patch(
  "/preference",
  protect,
  validate(updateCharityPreferenceSchema),
  updateCharityPreference
);

// Charity profile
router.get("/:id", getCharityById);

// Admin-only management
router.post(
  "/",
  protect,
  authorize("admin"),
  validate(createCharitySchema),
  createCharity
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  validate(updateCharitySchema),
  updateCharity
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(charityIdSchema),
  deleteCharity
);

export default router;
