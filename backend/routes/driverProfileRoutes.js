import express from "express";
import {
  getDriverProfile,
  updateDriverProfile,
  updateVehicleInfo,
  uploadDocument,
  getDocumentsStatus,
  verifyDocument,
  rejectDocument,
  updateAvailability,
  updateLocation,
  getDriverStats,
  updateWorkAreas,
  getBankAccount,
  updateBankAccount,
  toggleOnlineStatus,
  getAvailableOrders,
  getDriverOrders,
  getDriverEarnings,
  getDriverTransactions,
  getDriverOrderDetail,
  createWithdrawal,
  getWithdrawals,
  getBalance,
} from "../controllers/driverProfileController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Driver profile routes
router.get("/", getDriverProfile);
router.put("/", updateDriverProfile);

// Vehicle information routes
router.put("/vehicle", updateVehicleInfo);

// Documents routes (Driver)
router.get("/documents/status", getDocumentsStatus);
router.put("/documents/:documentType", uploadSingle("file"), uploadDocument);

// Documents admin routes (Admin only)
router.put(
  "/documents/:documentType/verify",
  authorize("admin"),
  verifyDocument,
);
router.put(
  "/documents/:documentType/reject",
  authorize("admin"),
  rejectDocument,
);

// Availability routes
router.put("/availability", updateAvailability);
router.put("/status", toggleOnlineStatus);

// Location update route
router.put("/location", updateLocation);

// Work areas route
router.put("/work-areas", updateWorkAreas);

// Statistics route
router.get("/stats", getDriverStats);

// Bank account routes
router.get("/bank-account", getBankAccount);
router.put("/bank-account", updateBankAccount);

// Order routes
router.get("/available-orders", getAvailableOrders);
router.get("/my-orders", getDriverOrders);
router.get("/orders/:orderId", getDriverOrderDetail);

// Earnings and transactions
router.get("/earnings", getDriverEarnings);
router.get("/transactions", getDriverTransactions);
router.get("/balance", getBalance);

// Withdrawals
router.post("/withdrawals", createWithdrawal);
router.get("/withdrawals", getWithdrawals);

export default router;
