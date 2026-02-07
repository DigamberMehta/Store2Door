import express from "express";
import * as refundController from "../../controllers/refundController.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = express.Router();

// All routes require authentication as admin
router.use(authenticate);
router.use(authorize("admin"));

// Wallet management routes (mounted at /admin/wallets)
// Note: Flagged wallets and stats endpoints removed with CustomerWallet model
// Can be reimplemented using Transaction model aggregations if needed
// router.get("/flagged", refundController.adminGetFlaggedWallets);
// router.get("/stats", refundController.adminGetWalletStats);

export default router;
