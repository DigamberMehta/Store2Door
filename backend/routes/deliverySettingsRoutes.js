import express from "express";
import {
  getDeliverySettings,
  createOrUpdateSettings,
  calculateCharge
} from "../controllers/deliverySettingsController.js";

const router = express.Router();

// Public routes
router.get("/", getDeliverySettings);
router.get("/calculate-charge", calculateCharge);

// Admin routes (add protect and admin middleware when ready)
router.post("/", createOrUpdateSettings);

export default router;
