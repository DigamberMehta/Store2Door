import express from "express";
import {
  registerDriver,
  loginDriver,
  refreshToken,
  logoutDriver,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/driverAuthController.js";
import { authenticate, rateLimitByUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", rateLimitByUser(15 * 60 * 1000, 5), registerDriver);
router.post("/login", rateLimitByUser(15 * 60 * 1000, 10), loginDriver);
router.post("/refresh", rateLimitByUser(15 * 60 * 1000, 20), refreshToken);
router.post(
  "/forgot-password",
  rateLimitByUser(15 * 60 * 1000, 3),
  forgotPassword,
);
router.put(
  "/reset-password",
  rateLimitByUser(15 * 60 * 1000, 5),
  resetPassword,
);

// Private routes (authenticated users)
router.use(authenticate);

// Driver profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.post("/logout", logoutDriver);

export default router;
