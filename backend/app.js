import express from "express";
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
import { errorHandler, notFound } from "./middleware/validation.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Frontend customer app
      "http://localhost:5174", // Delivery rider app
      "http://localhost:5175", // Admin/Store app (future)
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
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
    message: "Welcome to Door2Door API",
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
// Routes
app.use("/api/users", userRoutes);
app.use("/api/customer-profile", customerProfileRoutes);
app.use("/api/drivers", driverAuthRoutes);
app.use("/api/driver-profile", driverProfileRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/door2door"
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

    app.listen(PORT, () => {
      console.log(`
 Door2Door API Server Running
 Port: ${PORT}
 Environment: ${process.env.NODE_ENV || "development"}
 API Docs: http://localhost:${PORT}/api
 Health Check: http://localhost:${PORT}/api/health
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
