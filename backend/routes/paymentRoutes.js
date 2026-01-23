import express from "express";
import {
  createCheckout,
  createPayment,
  confirmPayment,
  handleWebhook,
  getPayment,
  getPayments,
  refundPayment,
} from "../controllers/paymentController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Webhook endpoint (no authentication - verified by signature)
router.post("/webhook", handleWebhook);

// All other routes require authentication
router.use(authenticate);

// Payment operations
router.post("/checkout", createCheckout); // Create checkout session
router.post("/create", createPayment); // Create direct payment with token
router.get("/:paymentId/confirm", confirmPayment); // Confirm payment status
router.get("/:paymentId", getPayment); // Get single payment
router.get("/", getPayments); // Get user's payment history
router.post("/:paymentId/refund", refundPayment); // Request refund

export default router;
