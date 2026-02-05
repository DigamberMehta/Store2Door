import express from "express";
import { getStoreDashboardStats } from "../../controllers/dashboardController.js";
import {
  getMyStore,
  getMyStoreProfile,
  getMyStoreLocation,
  getMyStoreFeatures,
  getMyStoreBankAccount,
  getMyStoreOperatingHours,
  updateOperatingHours,
  updateDeliverySettings,
} from "../../controllers/storeController.js";
import {
  getStoreOperations,
  updateTemporaryClosure,
} from "../../controllers/store/storeOperationsController.js";

const router = express.Router();

// Get own store information (full - use sparingly)
router.get("/my", getMyStore);

// Get specific sections of store data
router.get("/my/profile", getMyStoreProfile);
router.get("/my/location", getMyStoreLocation);
router.get("/my/features", getMyStoreFeatures);
router.get("/my/bank-account", getMyStoreBankAccount);
router.get("/my/operating-hours", getMyStoreOperatingHours);

// Update store operating hours (ONLY endpoint store managers can update)
router.put("/my/operating-hours", updateOperatingHours);

// Update store delivery settings
router.put("/my/delivery-settings", updateDeliverySettings);

// Store operations management
router.get("/my/operations", getStoreOperations);
router.put("/my/operations/temp-closure", updateTemporaryClosure);

// Get store statistics
router.get("/stats", getStoreDashboardStats);

export default router;
