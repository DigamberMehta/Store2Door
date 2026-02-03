import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId, role = "driver") {
    if (this.socket && this.isConnected) {
      console.log("Socket already connected");
      return this.socket;
    }

    // Remove /api from the URL for socket connection
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const SOCKET_URL = apiUrl.replace(/\/api\/?$/, "");

    console.log("Creating socket connection to:", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
      this.isConnected = true;

      // Send join event with user info
      this.socket.emit("join", { userId, role });
      console.log("Sent join event:", { userId, role });

      // Send current availability status to server (for drivers)
      if (role === "driver") {
        try {
          const driverStr = localStorage.getItem("driver");
          if (driverStr) {
            const driver = JSON.parse(driverStr);
            const isAvailable = driver.isAvailable || false;

            this.socket.emit("driver:availability-update", {
              driverId: userId,
              isAvailable: isAvailable,
            });
            console.log(
              `[Socket] Sent initial availability status: ${isAvailable}`,
            );
          }
        } catch (error) {
          console.error("[Socket] Error sending initial availability:", error);
        }
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join order tracking room
  joinOrderTracking(orderId, driverId) {
    if (!this.socket || !this.isConnected) {
      console.error(
        "[Socket Service] Cannot join order - socket not connected",
      );
      return;
    }

    console.log(
      `[Socket Service] Emitting driver:join-order with orderId: ${orderId}, driverId: ${driverId}`,
    );
    this.socket.emit("driver:join-order", { orderId, driverId });
    console.log(`[Socket Service] Joined order tracking: ${orderId}`);
  }

  // Leave order tracking room
  leaveOrderTracking(orderId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit("leave-order", { orderId });
    console.log(`Left order tracking: ${orderId}`);
  }

  // Send driver location update
  sendLocationUpdate(orderId, location) {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    // Get driver ID from localStorage
    const driverStr = localStorage.getItem("driver");
    let driverId = null;

    if (driverStr) {
      try {
        const driver = JSON.parse(driverStr);
        driverId = driver._id || driver.id;
      } catch (error) {
        console.error("Error parsing driver data:", error);
      }
    }

    if (!driverId) {
      console.error("Driver ID not found in localStorage");
      return;
    }

    this.socket.emit("driver:location", {
      driverId,
      orderId,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }

  // Send order status update
  sendOrderStatusUpdate(orderId, status) {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("order:status-update", {
      orderId,
      status,
    });
  }

  // Listen for events from server (if needed)
  on(event, callback) {
    if (this.socket) {
      console.log(`[Socket Service] Registering listener for event: ${event}`);
      this.socket.on(event, callback);
    } else {
      console.error(
        `[Socket Service] Cannot register listener - socket not initialized`,
      );
    }
  }

  off(event, callback) {
    if (this.socket) {
      console.log(`[Socket Service] Removing listener for event: ${event}`);
      this.socket.off(event, callback);
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
