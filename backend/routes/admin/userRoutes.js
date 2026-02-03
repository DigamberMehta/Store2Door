import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStatsSummary,
  bulkUpdateUsers,
  toggleRiderStatus,
  updateRiderVehicle,
  updateRiderBankDetails,
} from "../../controllers/adminUserController.js";

const router = express.Router();

// Get user statistics summary (must be before /:id route)
router.get("/stats/summary", getUserStatsSummary);

// Get all users with filters and pagination
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Update user
router.put("/:id", updateUser);

// Delete user (soft delete)
router.delete("/:id", deleteUser);

// Toggle user active status
router.patch("/:id/toggle-status", toggleUserStatus);

// Bulk actions
router.post("/bulk-update", bulkUpdateUsers);

// Rider-specific routes
router.patch("/:userId/rider/status", toggleRiderStatus);
router.put("/:userId/rider/vehicle", updateRiderVehicle);
router.put("/:userId/rider/bank-details", updateRiderBankDetails);

export default router;
