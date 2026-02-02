import express from "express";
import {
  submitSupportTicket,
  getMyOrdersForSupport,
} from "../controllers/supportController.js";
import { authenticate, rateLimitByUser } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Support ticket routes
router.post("/ticket", rateLimitByUser(15 * 60 * 1000, 5), submitSupportTicket);
router.get("/my-orders", getMyOrdersForSupport);

export default router;
