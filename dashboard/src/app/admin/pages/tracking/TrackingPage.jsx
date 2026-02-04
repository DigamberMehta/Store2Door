import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import DriverMap from "../../components/tracking/map/DriverMap";
import TrackingSidebar from "../../components/tracking/sidebar/TrackingSidebar";
import OrderAssignmentSidebar from "../../components/tracking/sidebar/OrderAssignmentSidebar";
import { trackingAPI } from "../../../../services/admin/api/tracking/tracking.api";
import { ordersAPI } from "../../../../services/admin/api/orders.api";
import io from "socket.io-client";

const TrackingPage = () => {
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [socket, setSocket] = useState(null);

  // Fetch riders and orders data
  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);

      const [ridersResponse, statsResponse, ordersResponse] = await Promise.all(
        [
          trackingAPI.getActiveRiders(true),
          trackingAPI.getRiderStats(),
          ordersAPI.getAllOrders({
            status: [
              "pending",
              "assigned",
              "ready_for_pickup",
              "picked_up",
              "on_the_way",
            ],
          }),
        ],
      );

      if (ridersResponse.success) {
        setRiders(ridersResponse.data.riders || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (ordersResponse.success) {
        setOrders(ordersResponse.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tracking data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:3000",
      {
        withCredentials: true,
      },
    );

    newSocket.on("connect", () => {
      console.log("Socket connected for admin tracking");
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}");
      newSocket.emit("join", { userId: adminUser._id, role: "admin" });
    });

    // Listen for order status updates
    newSocket.on(
      "order:status-changed",
      ({ orderId, status, trackingData }) => {
        console.log("Order status updated:", orderId, status);

        // Create new tracking history entry
        const newHistoryEntry = {
          status,
          updatedAt: new Date(),
          ...trackingData,
        };

        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status,
                  trackingHistory: [
                    ...(order.trackingHistory || []),
                    newHistoryEntry,
                  ],
                }
              : order,
          ),
        );

        // Update selected order if it matches
        setSelectedOrder((prev) =>
          prev?._id === orderId
            ? {
                ...prev,
                status,
                trackingHistory: [
                  ...(prev.trackingHistory || []),
                  newHistoryEntry,
                ],
              }
            : prev,
        );
      },
    );

    // Listen for driver location updates
    newSocket.on("driver:location-update", ({ orderId, location }) => {
      console.log("Driver location updated for order:", orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, driverLocation: location }
            : order,
        ),
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData(false);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRiderSelect = (rider) => {
    setSelectedRider(rider);
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  const handleRefresh = () => {
    fetchData(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Left Sidebar - Riders */}
      <TrackingSidebar
        riders={riders}
        orders={orders}
        selectedRider={selectedRider}
        selectedOrder={selectedOrder}
        onRiderSelect={handleRiderSelect}
        onOrderSelect={handleOrderSelect}
        stats={stats}
        onOrderAssign={handleRefresh}
      />

      {/* Map */}
      <div className="flex-1 relative">
        <DriverMap
          riders={riders}
          selectedRider={selectedRider}
          onRiderSelect={handleRiderSelect}
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors ${
              refreshing ? "animate-spin" : ""
            }`}
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg shadow-lg font-medium text-sm transition-colors ${
              autoRefresh
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
          </button>
        </div>

        {/* Last Updated */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2">
          <p className="text-xs text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Right Sidebar - Order Assignment */}
      <div className="w-96 h-full shadow-2xl">
        <OrderAssignmentSidebar
          orders={orders}
          selectedOrder={selectedOrder}
          onOrderSelect={handleOrderSelect}
        />
      </div>
    </div>
  );
};

export default TrackingPage;
