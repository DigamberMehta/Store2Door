import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Store from "../models/Store.js";
import { asyncHandler } from "../middleware/validation.js";

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
  const {
    name,
    email,
    phone,
    password,
    role = "customer",
    storeName,
  } = req.body;

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

  // If role is store_manager, automatically create a store
  if (role === "store_manager") {
    try {
      await Store.create({
        name: storeName || `${name}'s Store`,
        description: "Fresh and delicious food at your doorstep.",
        managerId: user._id,
        email: email,
        contactInfo: {
          phone: phone,
          email: email,
        },
        address: {
          street: "To be updated",
          city: "To be updated",
          state: "To be updated",
          province: "To be updated",
          zipCode: "000000",
          postalCode: "000000",
          country: "India",
          latitude: 0,
          longitude: 0,
        },
        businessType: ["restaurant"],
        businessLicense: `PENDING-${Date.now()}`,
        taxId: `PENDING-${Date.now()}`,
        commissionRate: 10,
        deliverySettings: {
          deliveryRadius: 5,
          minimumOrder: 0,
          deliveryFee: 0,
          averagePreparationTime: 30,
        },
        isActive: false, // Wait for admin approval or profile completion
        isApproved: false,
      });
      console.log(`✅ Store created for user: ${user._id}`);
    } catch (storeError) {
      console.error(
        "Error creating store during registration:",
        storeError.message,
      );
      if (storeError.errors) {
        Object.keys(storeError.errors).forEach((key) => {
          console.error(`  - ${key}: ${storeError.errors[key].message}`);
        });
      }
      // We don't fail user registration if store creation fails,
      // but in production you might want to handle this more strictly
    }
  }

  // Generate token
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken();

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

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
 * @desc    Forgot password
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email, isActive: true });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found with this email",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

  await user.save();

  // TODO: Send reset token via email
  // For now, return it in response (remove in production)
  res.json({
    success: true,
    message: "Password reset token generated",
    resetToken, // Remove this in production
  });
});

/**
 * @desc    Reset password
 * @route   PUT /api/users/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

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

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined; // Invalidate refresh token
  await user.save();

  res.json({
    success: true,
    message: "Password reset successfully",
  });
});
