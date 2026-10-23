
import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
  createCheckout,
  getMySubscription,
  cancelSubscription,
    getMyContributions,
} from "./subscription.controller.js";

import { checkoutSchema } from "./subscription.validation.js";

const router = Router();

router.use(protect);
router.get("/contributions", getMyContributions);

router.post("/checkout", validate(checkoutSchema), createCheckout);
router.get("/me", getMySubscription);
router.post("/cancel", cancelSubscription);
  
export default router;
