
import { Router } from "express";
import {
  getMyWinners,
  submitProof,
  listWinners,
  getWinnerById,
  reviewClaim,
  markPayoutPaid,
  setPrizeAmount,
  calculateWinnerForUser,
  calculateWinnersForDraw,
} from "./winner.controller.js";

import {
  winnerIdSchema,
  submitProofSchema,
  reviewClaimSchema,
  listWinnersSchema,
  setPrizeAmountSchema,
  calculateWinnerSchema,
  drawIdSchema,
} from "./winner.validation.js";

import { protect, restrictTo } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

router.use(protect);

// User routes.
router.get("/me", getMyWinners);

router.post(
  "/:id/proof",
  validate(submitProofSchema),
  submitProof
);

// Admin-only routes.
router.use(restrictTo("admin"));

router.post(
  "/draw/:id/calculate",
  validate(calculateWinnerSchema),
  calculateWinnerForUser
);

router.post(
  "/draw/:id/calculate-all",
  validate(drawIdSchema),
  calculateWinnersForDraw
);

router.get("/", validate(listWinnersSchema), listWinners);

router.get("/:id", validate(winnerIdSchema), getWinnerById);

router.patch("/:id/review", validate(reviewClaimSchema), reviewClaim);

router.patch("/:id/prize", validate(setPrizeAmountSchema), setPrizeAmount);

router.patch("/:id/payout", validate(winnerIdSchema), markPayoutPaid);

export default router;
