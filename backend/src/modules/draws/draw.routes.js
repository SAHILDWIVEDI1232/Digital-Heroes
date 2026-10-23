
import { Router } from "express";
import {
  createDraw,
  listDraws,
  listPublishedDraws,
  getDraw,
  simulateDraw,
  publishDraw,
  distributeDraw,
} from "./draw.controller.js";

import { protect, restrictTo } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
  createDrawSchema,
  drawIdSchema,
  publishDrawSchema,
  distributeDrawSchema,
} from "./draw.validation.js";

const router = Router();

// Logged-in players can see published results only.
router.get("/published", protect, listPublishedDraws);

// All routes below require an authenticated admin.
router.use(protect, restrictTo("admin"));

router.get("/", listDraws);

router.post("/", validate(createDrawSchema), createDraw);

router.get("/:id", validate(drawIdSchema), getDraw);

router.post("/:id/simulate", validate(drawIdSchema), simulateDraw);

router.post("/:id/publish", validate(publishDrawSchema), publishDraw);

// Distribute prizes for a draw — admin only.
router.post(
  "/:id/distribute",
  validate(distributeDrawSchema),
  distributeDraw
);

export default router;
