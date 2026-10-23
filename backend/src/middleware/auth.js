import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import  ApiError  from "../utils/ApiError.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.sub).select("-password");

    if (!user || !user.isActive) {
      throw new ApiError(401, "Account unavailable");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);

    return next(new ApiError(401, "Invalid or expired token"));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Access denied"));
    }

    next();
  };
}

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};
