import { Server } from "socket.io";
import Order from "../models/Order.js";
import DeliveryRiderProfile from "../models/DeliveryRiderProfile.js";
import locationService from "../services/locationService.js";

let io;

// Connected users: { userId: socketId }
const connectedUsers = new Map();

// Driver availability status: { driverId: isAvailable }
const driverAvailability = new Map();

// Driver locations: { driverId: { latitude, longitude, timestamp } }
const driverLocations = new Map();

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "https://store2door-one.vercel.app",
        "https://store2door-dashboard.vercel.app",
        "https://store2doordelivery.co.za",
        "https://www.store2doordelivery.co.za",
        process.env.FRONTEND_URL,
      ].filter(Boolean),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins with their ID
    socket.on("join", async ({ userId, role }) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.role = role;

      console.log(`User ${userId} (${role}) joined with socket ${socket.id}`);

      // If driver, fetch and store their availability status
      if (role === "driver") {
        try {
          const profile = await DeliveryRiderProfile.findOne({ userId });
          const isAvailable = profile?.isAvailable || false;
          driverAvailability.set(userId, isAvailable);
          console.log(`Driver ${userId} availability status: ${isAvailable}`);
        } catch (error) {
          console.error(`Error fetching driver ${userId} availability:`, error);
          driverAvailability.set(userId, false);
        }
      }

      // Join user-specific room
      socket.join(`user:${userId}`);
    });

    // Driver joins an order room for tracking
    socket.on("driver:join-order", ({ orderId, driverId }) => {
      socket.join(`order:${orderId}`);
      console.log(`Driver ${driverId} joined order ${orderId}`);
    });

    // Customer joins an order room for tracking
    socket.on("customer:join-order", ({ orderId, customerId }) => {
      socket.join(`order:${orderId}`);
      console.log(`Customer ${customerId} joined order ${orderId}`);

      // Send current driver location if available
      const orderDriverId = getDriverIdForOrder(orderId);
      if (orderDriverId && driverLocations.has(orderDriverId)) {
        socket.emit("driver:location-update", {
          orderId,
          location: driverLocations.get(orderDriverId),
        });
      }
    });

    // Driver sends location update
    socket.on(
      "driver:location",
      async ({ driverId, orderId, latitude, longitude }) => {
        const location = {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        };

        // Store driver location in memory
        driverLocations.set(driverId, location);

        // Store in Redis for tracking page (only if driverId is valid)
        if (driverId && driverId !== "null" && driverId !== "undefined") {
          await locationService.updateLocation(driverId, latitude, longitude);
        }

        // Update driver location in order document
        try {
          await Order.findByIdAndUpdate(orderId, {
            driverLocation: {
              latitude,
              longitude,
              updatedAt: new Date(),
            },
          });
        } catch (error) {
          console.error("Error updating driver location in order:", error);
        }

        // Broadcast to everyone tracking this order
        io.to(`order:${orderId}`).emit("driver:location-update", {
          orderId,
          location,
        });
      },
    );

    // Order status update
    socket.on("order:status-update", ({ orderId, status, trackingData }) => {
      io.to(`order:${orderId}`).emit("order:status-changed", {
        orderId,
        status,
        trackingData,
        timestamp: new Date().toISOString(),
      });

      console.log(`Order ${orderId} status updated to ${status}`);
    });

    // Leave order room
    socket.on("leave-order", ({ orderId }) => {
      socket.leave(`order:${orderId}`);
      console.log(`User left order ${orderId}`);
    });

    // Driver updates availability status
    socket.on("driver:availability-update", ({ driverId, isAvailable }) => {
      driverAvailability.set(driverId, isAvailable);
      console.log(`Driver ${driverId} availability updated to: ${isAvailable}`);
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        if (socket.role === "driver") {
          driverAvailability.delete(socket.userId);
        }
        console.log(`User ${socket.userId} disconnected`);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Helper function to emit to specific user
export const emitToUser = (userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

// Helper function to emit to order room
export const emitToOrder = (orderId, event, data) => {
  if (io) {
    console.log(`[Socket] Emitting ${event} to order:${orderId}`, data);
    io.to(`order:${orderId}`).emit(event, data);
  } else {
    console.error(`[Socket] Cannot emit - io not initialized`);
  }
};

// Helper to broadcast order status change
export const broadcastOrderStatusChange = (orderId, status, trackingData) => {
  emitToOrder(orderId, "order:status-changed", {
    orderId,
    status,
    trackingData,
    timestamp: new Date().toISOString(),
  });
};

// Helper to broadcast to all drivers
export const broadcastToDrivers = (event, data) => {
  if (io) {
    console.log(`[Socket] Broadcasting ${event} to online drivers only`, data);

    // Get all online drivers
    const onlineDrivers = [];
    for (const [userId, isAvailable] of driverAvailability.entries()) {
      if (isAvailable && connectedUsers.has(userId)) {
        onlineDrivers.push(userId);
      }
    }

    console.log(`[Socket] Found ${onlineDrivers.length} online drivers`);

    // Emit to each online driver
    onlineDrivers.forEach((driverId) => {
      const socketId = connectedUsers.get(driverId);
      if (socketId) {
        io.to(socketId).emit(event, data);
      }
    });
  } else {
    console.error(`[Socket] Cannot broadcast - io not initialized`);
  }
};

// Helper to get driver location
export const getDriverLocation = (driverId) => {
  return driverLocations.get(driverId);
};

// Temporary helper - in production, fetch from database
const getDriverIdForOrder = (orderId) => {
  // This should query the database for the order's riderId
  // For now, returning null - will be handled by backend
  return null;
};

export default {
  initializeSocket,
  getIO,
  emitToUser,
  emitToOrder,
  broadcastToDrivers,
};
