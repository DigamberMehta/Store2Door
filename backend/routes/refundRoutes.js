import express from "express";
import * as refundController from "../controllers/refundController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication as customer
router.use(authenticate);
router.use(authorize("customer"));

// Wallet routes
router.get("/wallet", refundController.getCustomerWallet);
router.get("/wallet/transactions", refundController.getWalletTransactions);

// Refund routes
router.post("/refunds", refundController.submitRefund);
router.get("/refunds", refundController.getMyRefunds);
router.get("/refunds/:id", refundController.getRefundById);
router.delete("/refunds/:id", refundController.cancelRefund);

export default router;
