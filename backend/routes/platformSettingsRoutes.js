import express from "express";
import {
  getPlatformSettings,
  updatePlatformSettings,
  calculateCustomerPrice,
} from "../controllers/platformSettingsController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getPlatformSettings);
router.get("/calculate-price", calculateCustomerPrice);

// Admin routes
router.put("/", authenticate, authorize("admin"), updatePlatformSettings);

export default router;
