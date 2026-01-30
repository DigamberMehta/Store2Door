import { io } from "socket.io-client";

// Remove /api from the URL for socket connection
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SOCKET_URL = apiUrl.replace(/\/api\/?$/, "");

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId, role = "store") {
    if (this.socket?.connected) {
      console.log(
        "[Dashboard Socket] Already connected, returning existing socket",
      );
      return this.socket;
    }

    console.log(
      "[Dashboard Socket] Creating new socket connection to:",
      SOCKET_URL,
    );

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("[Dashboard Socket] Connected with ID:", this.socket.id);
      this.connected = true;

      // Join with user ID
      this.socket.emit("join", { userId, role });
      console.log(
        "[Dashboard Socket] Sent join event with userId:",
        userId,
        "role:",
        role,
      );
    });

    this.socket.on("disconnect", () => {
      console.log("[Dashboard Socket] Disconnected");
      this.connected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Dashboard Socket] Connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log("[Dashboard Socket] Disconnecting...");
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Listen for new orders for the store
  onNewOrder(callback) {
    if (this.socket) {
      console.log("[Dashboard Socket] Listening for order:new-for-store event");
      this.socket.on("order:new-for-store", callback);
    }
  }

  // Listen for order status changes
  onOrderStatusChanged(callback) {
    if (this.socket) {
      console.log(
        "[Dashboard Socket] Listening for order:status-changed event",
      );
      this.socket.on("order:status-changed", callback);
    }
  }

  // Remove listeners
  offNewOrder() {
    if (this.socket) {
      this.socket.off("order:new-for-store");
    }
  }

  offOrderStatusChanged() {
    if (this.socket) {
      this.socket.off("order:status-changed");
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
