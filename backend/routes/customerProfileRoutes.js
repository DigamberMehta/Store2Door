import express from "express";
import {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress,
  updateCustomerPreferences,
  getCustomerStats,
  updateLastKnownLocation,
} from "../controllers/customerProfileController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Customer profile routes
router.get("/", getCustomerProfile);
router.put("/", updateCustomerProfile);

// Address management routes
router.get("/addresses", getCustomerAddresses);
router.post("/addresses", addCustomerAddress);
router.put("/addresses/:addressId", updateCustomerAddress);
router.delete("/addresses/:addressId", deleteCustomerAddress);
router.put("/addresses/:addressId/default", setDefaultAddress);

// Preferences route
router.put("/preferences", updateCustomerPreferences);

// Statistics route
router.get("/stats", getCustomerStats);

// Location update route
router.put("/location", updateLastKnownLocation);

export default router;
