import express from "express";
import {
  getPlatformFinancials,
  getFinancialsSummary,
  resetPlatformFinancials,
} from "../controllers/platformFinancialsController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize("admin"));

// Get full platform financials
router.get("/", getPlatformFinancials);

// Get financials summary
router.get("/summary", getFinancialsSummary);

// Reset financials (use with caution)
router.post("/reset", resetPlatformFinancials);

export default router;
