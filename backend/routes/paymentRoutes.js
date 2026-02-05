import express from "express";
import {
  verifyPaystackPayment,
  initializePaystackPayment,
  getPayment,
  getPayments,
} from "../controllers/paymentController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Paystack endpoints
router.post("/paystack/initialize", authenticate, initializePaystackPayment);
router.get("/paystack/verify/:reference", verifyPaystackPayment);

// All other routes require authentication
router.use(authenticate);

// Payment operations (Paystack)
router.get("/:paymentId", getPayment); // Get single payment
router.get("/", getPayments); // Get user's payment history

export default router;
