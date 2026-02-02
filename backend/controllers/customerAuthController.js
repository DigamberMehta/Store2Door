import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { asyncHandler } from "../middleware/validation.js";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../config/mailer.js";

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * @desc    Register user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role = "customer" } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email or phone",
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });

  // Generate token
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken();

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Send welcome email (non-blocking)
  if (email) {
    sendWelcomeEmail(email, name).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      token,
      refreshToken,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: "Email or phone is required",
    });
  }

  // Find user by email or phone
  const user = await User.findOne({
    $or: [{ email }, { phone }],
    isActive: true,
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Update last login
  user.lastLogin = new Date();

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  // Remove password from response
  user.password = undefined;

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user,
      token,
      refreshToken,
    },
  });
});

/**
 * @desc    Refresh token
 * @route   POST /api/users/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  const user = await User.findOne({ refreshToken, isActive: true });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }

  // Generate new tokens
  const newToken = generateToken(user._id);
  const newRefreshToken = generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save();

  res.json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      token: newToken,
      refreshToken: newRefreshToken,
    },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/users/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Update password
  user.password = newPassword;
  user.refreshToken = undefined; // Invalidate refresh token
  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * @desc    Forgot password - Send reset email
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });

  if (!user) {
    // Don't reveal if user exists for security
    return res.json({
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash and store token
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  await user.save();

  // Send reset email
  try {
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    res.json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    // If email fails, clear the reset token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.error("Error sending password reset email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reset email. Please try again later",
    });
  }
});

/**
 * @desc    Validate password reset token
 * @route   GET /api/users/validate-reset-token/:token
 * @access  Public
 */
export const validateResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  // Hash token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    isActive: true,
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  res.json({
    success: true,
    message: "Token is valid",
    data: {
      email: user.email,
      name: user.name,
    },
  });
});

/**
 * @desc    Reset password with token
 * @route   POST /api/users/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token and new password are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  // Hash token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    isActive: true,
  }).select("+refreshToken");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  // Update password
  user.password = newPassword;

  // Invalidate reset token
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Invalidate all existing sessions (refresh tokens)
  user.refreshToken = undefined;

  // Update last login
  user.lastLogin = new Date();

  await user.save();

  // Generate new tokens for immediate login
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken();

  // Store new refresh token
  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successfully. You are now logged in.",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    },
  });
});
