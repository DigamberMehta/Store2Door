import { io } from "socket.io-client";

// Remove /api from the URL for socket connection
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SOCKET_URL = apiUrl.replace(/\/api\/?$/, "");

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId, role = "customer") {
    if (this.socket?.connected) {
      console.log(
        "[Customer Socket] Already connected, returning existing socket",
      );
      return this.socket;
    }

    console.log(
      "[Customer Socket] Creating new socket connection to:",
      SOCKET_URL,
    );

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("[Customer Socket] Connected with ID:", this.socket.id);
      this.connected = true;

      // Join with user ID
      this.socket.emit("join", { userId, role });
      console.log(
        "[Customer Socket] Sent join event with userId:",
        userId,
        "role:",
        role,
      );
    });

    this.socket.on("disconnect", () => {
      console.log("[Customer Socket] Disconnected");
      this.connected = false;
    });

    this.socket.on("error", (error) => {
      console.error("[Customer Socket] Error:", error);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Customer Socket] Connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join order tracking room
  joinOrderTracking(orderId, customerId) {
    if (this.socket) {
      console.log(
        `[Customer Socket] Emitting customer:join-order with orderId: ${orderId}, customerId: ${customerId}`,
      );
      this.socket.emit("customer:join-order", { orderId, customerId });
      console.log(`[Customer Socket] Joined order tracking: ${orderId}`);
    } else {
      console.error(
        `[Customer Socket] Cannot join order - socket not initialized`,
      );
    }
  }

  // Leave order tracking room
  leaveOrderTracking(orderId) {
    if (this.socket) {
      this.socket.emit("leave-order", { orderId });
      console.log(`Left order tracking: ${orderId}`);
    }
  }

  // Listen for driver location updates
  onDriverLocationUpdate(callback) {
    if (this.socket) {
      console.log(
        "[Customer Socket] Registering listener for driver:location-update",
      );
      const wrappedCallback = (data) => {
        console.log(
          `[Customer Socket] Received driver:location-update event:`,
          data,
        );
        callback(data);
      };
      this.socket.on("driver:location-update", wrappedCallback);
      // Store the wrapped callback for cleanup
      this._locationCallback = wrappedCallback;
    } else {
      console.error(
        "[Customer Socket] Cannot register listener - socket not initialized",
      );
    }
  }

  // Listen for order status changes
  onOrderStatusChange(callback) {
    if (this.socket) {
      console.log(
        `[Customer Socket] Registering listener for order:status-changed`,
      );
      this.socket.on("order:status-changed", callback);
    } else {
      console.error(
        `[Customer Socket] Cannot register listener - socket not initialized`,
      );
    }
  }

  // Remove listeners
  offDriverLocationUpdate() {
    if (this.socket && this._locationCallback) {
      console.log("[Customer Socket] Removing driver:location-update listener");
      this.socket.off("driver:location-update", this._locationCallback);
      this._locationCallback = null;
    }
  }

  offOrderStatusChange() {
    if (this.socket && this._statusChangeCallback) {
      console.log("[Customer Socket] Removing order:status-changed listener");
      this.socket.off("order:status-changed", this._statusChangeCallback);
      this._statusChangeCallback = null;
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
