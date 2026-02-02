import express from "express";
import {
  loginUser,
  refreshToken,
  logoutUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  validateResetToken,
  resetPassword,
} from "../controllers/userController.js";
import { authenticate, rateLimitByUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", rateLimitByUser(15 * 60 * 1000, 10), loginUser);
router.post("/refresh", rateLimitByUser(15 * 60 * 1000, 20), refreshToken);
router.post(
  "/forgot-password",
  rateLimitByUser(15 * 60 * 1000, 3),
  forgotPassword,
);
router.get(
  "/validate-reset-token/:token",
  rateLimitByUser(15 * 60 * 1000, 10),
  validateResetToken
);
router.post(
  "/reset-password",
  rateLimitByUser(15 * 60 * 1000, 5),
  resetPassword,
);

// Private routes (authenticated users)
router.use(authenticate);

// User profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.post("/logout", logoutUser);

export default router;
