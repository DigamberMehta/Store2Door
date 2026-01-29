import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import { getStoreDashboardStats } from "../../controllers/dashboardController.js";

const router = express.Router();

// All routes require authentication and store_manager role
router.use(authenticate);
router.use(authorize("store_manager"));

// Get own store information
router.get("/", async (req, res) => {
  // TODO: Implement get own store
  res.json({ success: true, message: "Get own store endpoint" });
});

// Update own store
router.put("/", async (req, res) => {
  // TODO: Implement update store
  res.json({ success: true, message: "Update store endpoint" });
});

// Update store operating hours
router.put("/operating-hours", async (req, res) => {
  // TODO: Implement update operating hours
  res.json({ success: true, message: "Update operating hours endpoint" });
});

// Update store delivery settings
router.put("/delivery-settings", async (req, res) => {
  // TODO: Implement update delivery settings
  res.json({ success: true, message: "Update delivery settings endpoint" });
});

// Get store statistics
router.get("/stats", getStoreDashboardStats);

export default router;
