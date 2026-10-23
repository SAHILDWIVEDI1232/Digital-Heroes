
import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";

import {
  getAdminOverview,
  getAdminUsers,
  getAdminCharities,
  getAdminDraws,
  getAdminContributions,
} from "./admin.controller.js";
import {
  createCharity,
  updateCharity,
  deleteCharity,
} from "./admin.charity.controller.js";
const router = Router();

// Every route below requires a logged-in admin.
router.use(protect, authorize("admin"));
router.post("/charities", createCharity);
router.patch("/charities/:id", updateCharity);
router.delete("/charities/:id", deleteCharity);

router.get("/overview", getAdminOverview);
router.get("/users", getAdminUsers);
router.get("/charities", getAdminCharities);
router.get("/draws", getAdminDraws);
router.get("/contributions", getAdminContributions);

export default router;
