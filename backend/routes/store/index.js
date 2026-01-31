import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import storeProductRoutes from "./productRoutes.js";
import storeStoreRoutes from "./storeRoutes.js";
import storeOrderRoutes from "./orderRoutes.js";
import storeReviewRoutes from "./reviewRoutes.js";
import storeEarningsRoutes from "./earningsRoutes.js";
import storeUploadRoutes from "./uploadRoutes.js";
import storePaymentRoutes from "./paymentRoutes.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../../controllers/userController.js";

const router = express.Router();

// Public auth routes (no authentication required)
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post("/auth/forgot-password", forgotPassword);
router.put("/auth/reset-password", resetPassword);

// Protected routes - require authentication and store_manager role
router.use(authenticate);
router.use(authorize("store_manager"));

// Logout (requires auth)
router.post("/auth/logout", logoutUser);

// Mount sub-routes
router.use("/products", storeProductRoutes);
router.use("/stores", storeStoreRoutes);
router.use("/orders", storeOrderRoutes);
router.use("/reviews", storeReviewRoutes);
router.use("/earnings", storeEarningsRoutes);
router.use("/upload", storeUploadRoutes);
router.use("/payments", storePaymentRoutes);

export default router;
