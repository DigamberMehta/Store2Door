import express from "express";
import * as refundController from "../../controllers/refundController.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = express.Router();

// All routes require authentication as admin
router.use(authenticate);
router.use(authorize("admin"));

// Refund management routes (mounted at /admin/refunds)
router.get("/", refundController.adminGetAllRefunds);
router.get("/pending", refundController.adminGetPendingRefunds);
router.get("/stats", refundController.adminGetRefundStats);
router.get("/:id", refundController.adminGetRefundById);
router.post("/:id/approve", refundController.adminApproveRefund);
router.post("/:id/reject", refundController.adminRejectRefund);
router.post("/:id/review", refundController.adminMarkUnderReview);

export default router;
