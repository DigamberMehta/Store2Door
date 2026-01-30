import express from "express";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import customerProfileRoutes from "./routes/customerProfileRoutes.js";
import driverAuthRoutes from "./routes/driverAuthRoutes.js";
import driverProfileRoutes from "./routes/driverProfileRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import suggestionsRoutes from "./routes/suggestions.js";
import couponRoutes from "./routes/couponRoutes.js";
import deliverySettingsRoutes from "./routes/deliverySettingsRoutes.js";
import platformSettingsRoutes from "./routes/platformSettingsRoutes.js";
import platformFinancialsRoutes from "./routes/platformFinancialsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/admin/index.js";
import storeManagerRoutes from "./routes/store/index.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { errorHandler, notFound } from "./middleware/validation.js";
import { connectRedis } from "./config/redis.js";
import { initializeSocket } from "./config/socket.js";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Frontend customer app
      "http://localhost:5174", // Delivery rider app
      "http://localhost:5175",
      "http://localhost:5176", // Admin/Store app (future)
      "https://door2door-one.vercel.app", // Production customer app
      "https://door2door-dashboard.vercel.app", // Production dashboard
      "https://store2doordelivery.co.za", // Production domain
      "https://www.store2doordelivery.co.za", // Production domain with www
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  }),
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const now = new Date();
  const istTime = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(now);
  console.log(`${req.method} ${req.originalUrl} - ${istTime}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// API info endpoint
app.get("/api/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Store2Door API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      customerProfile: "/api/customer-profile",
      categories: "/api/categories",
      products: "/api/products",
      stores: "/api/stores",
      health: "/api/health",
    },
    documentation: "/api/docs", // TODO: Add API documentation
  });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/delivery-settings", deliverySettingsRoutes);
app.use("/api/platform-settings", platformSettingsRoutes);
app.use("/api/platform-financials", platformFinancialsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
// Routes
app.use("/api/users", userRoutes);
app.use("/api/customer-profile", customerProfileRoutes);
app.use("/api/drivers", driverAuthRoutes);
app.use("/api/driver-profile", driverProfileRoutes);

// Dashboard routes
app.use("/api/admin", adminRoutes);
app.use("/api/managers", storeManagerRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/door2door",
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // Initialize Redis (optional)
    await connectRedis();

    // Initialize Socket.IO
    initializeSocket(httpServer);
    console.log("Socket.IO initialized");

    httpServer.listen(PORT, () => {
      console.log(`
 Door2Door API Server Running
 Port: ${PORT}
 Environment: ${process.env.NODE_ENV || "development"}
 API Docs: http://localhost:${PORT}/api
 Health Check: http://localhost:${PORT}/api/health
 WebSocket: Enabled
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

startServer();

export default app;
