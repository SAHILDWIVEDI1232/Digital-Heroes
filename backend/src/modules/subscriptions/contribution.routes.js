
import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";

import {
  getMyContributions,
  getContributionSummary,
} from "./contribution.controller.js";

const router = Router();

router.use(protect);

router.get("/me", getMyContributions);

router.get(
  "/admin/summary",
  authorize("admin"),
  getContributionSummary
);

export default router;
