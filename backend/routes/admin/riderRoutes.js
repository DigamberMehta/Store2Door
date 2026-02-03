import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  getActiveRiders,
  getAllRiders,
  getRiderStats,
} from "../../controllers/adminRiderController.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// Get rider statistics
router.get("/stats/summary", getRiderStats);

// Get all active riders with locations (for tracking)
router.get("/active", getActiveRiders);

// Get all riders with pagination
router.get("/", getAllRiders);

// Get rider by ID
router.get("/:id", async (req, res) => {
  // TODO: Implement get rider by ID
  res.json({ success: true, message: "Get rider by ID endpoint" });
});

// Verify rider document
router.post("/:id/verify-document", async (req, res) => {
  // TODO: Implement verify document
  res.json({ success: true, message: "Verify rider document endpoint" });
});

// Reject rider document
router.post("/:id/reject-document", async (req, res) => {
  // TODO: Implement reject document
  res.json({ success: true, message: "Reject rider document endpoint" });
});

// Get rider earnings
router.get("/:id/earnings", async (req, res) => {
  // TODO: Implement get rider earnings
  res.json({ success: true, message: "Get rider earnings endpoint" });
});

// Get rider statistics
router.get("/stats/summary", async (req, res) => {
  // TODO: Implement get rider stats
  res.json({ success: true, message: "Get rider stats endpoint" });
});

// Toggle rider active status
router.patch("/:id/toggle-active", async (req, res) => {
  // TODO: Implement toggle active
  res.json({ success: true, message: "Toggle rider active endpoint" });
});

export default router;
