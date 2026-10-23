import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
  register,
  login,
  getMe,
} from "./auth.controller.js";

import {
  registerSchema,
  loginSchema,
} from "./auth.validation.js";

const router = Router();

// Public routes — token required nahi hai
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected route — token required hai
router.get("/me", protect, getMe);

export default router;