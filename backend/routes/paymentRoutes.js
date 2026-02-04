import express from "express";
import {
  createCheckout,
  createPayment,
  confirmPayment,
  handleWebhook,
  getPayment,
  getPayments,
  initializePaystackPayment,
  verifyPaystackPayment,
} from "../controllers/paymentController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Webhook endpoint (no authentication - verified by signature)
router.post("/webhook", handleWebhook);

// Paystack endpoints
router.post("/paystack/initialize", authenticate, initializePaystackPayment);
router.get("/paystack/verify/:reference", verifyPaystackPayment);

// All other routes require authentication
router.use(authenticate);

// Payment operations (Yoco legacy)
router.post("/checkout", createCheckout); // Create checkout session
router.post("/create", createPayment); // Create direct payment with token
router.get("/:paymentId/confirm", confirmPayment); // Confirm payment status
router.get("/:paymentId", getPayment); // Get single payment
router.get("/", getPayments); // Get user's payment history

export default router;
