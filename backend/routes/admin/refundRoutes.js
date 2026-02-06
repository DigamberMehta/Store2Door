import express from "express";
import * as refundController from "../../controllers/refundController.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = express.Router();

// All routes require authentication as admin
router.use(authenticate);
router.use(authorize("admin"));

// Refund management routes
router.get("/refunds", refundController.adminGetAllRefunds);
router.get("/refunds/pending", refundController.adminGetPendingRefunds);
router.get("/refunds/stats", refundController.adminGetRefundStats);
router.get("/refunds/:id", refundController.adminGetRefundById);
router.post("/refunds/:id/approve", refundController.adminApproveRefund);
router.post("/refunds/:id/reject", refundController.adminRejectRefund);
router.post("/refunds/:id/review", refundController.adminMarkUnderReview);

// Wallet management routes
router.get("/wallets/flagged", refundController.adminGetFlaggedWallets);
router.get("/wallets/stats", refundController.adminGetWalletStats);

export default router;
