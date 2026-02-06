import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import adminUserRoutes from "./userRoutes.js";
import adminStoreRoutes from "./storeRoutes.js";
import adminProductRoutes from "./productRoutes.js";
import adminOrderRoutes from "./orderRoutes.js";
import adminCategoryRoutes from "./categoryRoutes.js";
import adminCouponRoutes from "./couponRoutes.js";
import adminReviewRoutes from "./reviewRoutes.js";
import adminPaymentRoutes from "./paymentRoutes.js";
import adminRiderRoutes from "./riderRoutes.js";
import adminAnalyticsRoutes from "./analyticsRoutes.js";
import adminDeliverySettingsRoutes from "./deliverySettingsRoutes.js";
import adminDashboardRoutes from "./dashboardRoutes.js";
import adminRefundRoutes from "./refundRoutes.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// Mount sub-routes
router.use("/dashboard", adminDashboardRoutes);
router.use("/users", adminUserRoutes);
router.use("/stores", adminStoreRoutes);
router.use("/products", adminProductRoutes);
router.use("/orders", adminOrderRoutes);
router.use("/categories", adminCategoryRoutes);
router.use("/coupons", adminCouponRoutes);
router.use("/reviews", adminReviewRoutes);
router.use("/payments", adminPaymentRoutes);
router.use("/riders", adminRiderRoutes);
router.use("/analytics", adminAnalyticsRoutes);
router.use("/delivery-settings", adminDeliverySettingsRoutes);
router.use("/refunds", adminRefundRoutes);
router.use("/wallets", adminRefundRoutes);

export default router;
