import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { env } from "../../config/env.js";
import  ApiError  from "../../utils/ApiError.js";

function createToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    selectedCharity: user.selectedCharity,
    charityPercentage: user.charityPercentage,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.validated.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.exists({ email: normalizedEmail });

    if (existingUser) {
      throw new ApiError(409, "Email is already registered");
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: publicUser(user),
        token: createToken(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is disabled");
    }

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: publicUser(user),
        token: createToken(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res) {
  res.json({
    success: true,
    data: { user: publicUser(req.user) },
  });
}