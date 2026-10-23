import { Router } from "express";

import { protect } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
  createScore,
  getScores,
  updateScore,
  deleteScore,
} from "./score.controller.js";

import {
  createScoreSchema,
  updateScoreSchema,
  scoreIdSchema,
} from "./score.validation.js";

const router = Router();

// Har route par login required hai.
router.use(protect);

router.get("/", getScores);
router.post("/", validate(createScoreSchema), createScore);
router.patch("/:id", validate(updateScoreSchema), updateScore);
router.delete("/:id", validate(scoreIdSchema), deleteScore);

export default router;