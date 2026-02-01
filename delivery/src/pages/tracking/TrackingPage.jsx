import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { Navigation } from "lucide-react";
import { ordersAPI } from "../../services/api";
import socketService from "../../services/socket";
import toast from "react-hot-toast";
import MapView from "./components/MapView";
import StatusBadge from "./components/StatusBadge";
import RouteCards from "./components/RouteCards";
import OrderItemsList from "./components/OrderItemsList";
import ActionButtons from "./components/ActionButtons";
import "mapbox-gl/dist/mapbox-gl.css";

const TrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Refs
  const map = useRef(null);
  const driverMarker = useRef(null);
  const watchId = useRef(null);

  // State
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Helper: Validate Coordinates
  const isValidCoord = (coord) => {
    return (
      Array.isArray(coord) &&
      coord.length === 2 &&
      coord[0] !== 0 &&
      coord[1] !== 0 &&
      !isNaN(coord[0]) &&
      !isNaN(coord[1])
    );
  };

  // Fetch Order Data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getOrderById(orderId);
        const orderData = response.data || response;
        setOrder(orderData);
        setError(null);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Debug: Log when order status changes
  useEffect(() => {
    if (order) {
      console.log(
        "[TrackingPage] Order state updated, current status:",
        order.status,
      );
    }
  }, [order?.status]);

  // Socket.IO connection and order tracking
  useEffect(() => {
    if (!orderId) {
      console.log("[TrackingPage] No orderId, skipping socket setup");
      return;
    }

    // Get driver ID from localStorage
    const driverStr = localStorage.getItem("driver");
    let driverId = null;

    if (driverStr) {
      try {
        const driver = JSON.parse(driverStr);
        driverId = driver._id || driver.id;
      } catch (e) {
        console.error("Failed to parse driver data:", e);
      }
    }

    if (!driverId) {
      console.error("No driverId found in localStorage");
      return;
    }

    console.log("[TrackingPage] Connecting socket for driver:", driverId);

    // Connect socket
    const socket = socketService.connect(driverId, "driver");

    if (!socket) {
      console.error("[TrackingPage] Failed to create socket connection");
      return;
    }

    console.log(
      "[TrackingPage] Socket instance created, connected:",
      socket.connected,
    );

    // Wait for connection
    const onConnect = () => {
      console.log("[TrackingPage] Socket connected, joining order room");
      setSocketConnected(true);
      // Join order tracking room after connection
      socketService.joinOrderTracking(orderId, driverId);
    };

    const onDisconnect = () => {
      console.log("[TrackingPage] Socket disconnected");
      setSocketConnected(false);
    };

    if (socket.connected) {
      console.log("[TrackingPage] Socket already connected");
      onConnect();
    } else {
      console.log("[TrackingPage] Waiting for socket to connect...");
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
    }

    // Listen for order status changes from store/customer
    const handleStatusChange = ({ status, trackingHistory }) => {
      console.log(
        "[TrackingPage] Order status changed via socket:",
        status,
        trackingHistory,
      );
      setOrder((prev) => {
        console.log("[TrackingPage] Previous order status:", prev?.status);
        const updated = {
          ...prev,
          status,
          trackingHistory: trackingHistory || prev.trackingHistory,
        };
        console.log("[TrackingPage] Updated order status:", updated.status);
        return updated;
      });
    };

    console.log("[TrackingPage] Registering order:status-changed listener");
    socketService.on("order:status-changed", handleStatusChange);

    // Cleanup
    return () => {
      if (socket) {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      }
      socketService.off("order:status-changed", handleStatusChange);
      socketService.leaveOrderTracking(orderId);
      setSocketConnected(false);
    };
  }, [orderId]); // Remove 'order' from dependencies to prevent re-running

  // Handle map ready callback
  const handleMapReady = (mapInstance, marker) => {
    map.current = mapInstance;
    driverMarker.current = marker;
  };

  // Track Driver Location
  useEffect(() => {
    if (!map.current || !order) return;

    const startTracking = () => {
      if ("geolocation" in navigator) {
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newDriverLocation = [longitude, latitude];

            if (driverMarker.current) {
              driverMarker.current.setLngLat(newDriverLocation);
            }

            // Send location update via socket (only if connected)
            if (socketConnected) {
              console.log("Sending driver location:", {
                orderId,
                latitude,
                longitude,
              });
              socketService.sendLocationUpdate(orderId, {
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
              });
            } else {
              console.log("Socket not connected yet, skipping location update");
            }

            updateRoute(newDriverLocation);
          },
          (err) => console.error("Location error:", err),
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          },
        );
      }
    };

    if (map.current.isStyleLoaded()) {
      startTracking();
    } else {
      map.current.on("load", startTracking);
    }

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [order, orderId]);

  // Update Route using Mapbox Directions API
  const updateRoute = async (driverLoc) => {
    if (!map.current?.getSource || !map.current?.isStyleLoaded()) return;

    const storeCoords =
      order.storeId?.address?.longitude && order.storeId?.address?.latitude
        ? [order.storeId.address.longitude, order.storeId.address.latitude]
        : order.storeId?.location?.coordinates;

    const customerCoords = [
      order.deliveryAddress?.longitude,
      order.deliveryAddress?.latitude,
    ];

    let waypoints = [driverLoc];

    // When assigned or ready_for_pickup: show route to store
    if (
      order.status === "assigned" ||
      order.status === "ready_for_pickup" ||
      order.status === "confirmed"
    ) {
      if (isValidCoord(storeCoords)) waypoints.push(storeCoords);
    }
    // When picked_up or on_the_way: show route to customer
    else if (order.status === "picked_up" || order.status === "on_the_way") {
      if (isValidCoord(customerCoords)) waypoints.push(customerCoords);
    }

    if (waypoints.length < 2) return;

    try {
      const waypointsString = waypoints.map((w) => w.join(",")).join(";");
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointsString}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.routes?.[0]) {
        const geoJson = {
          type: "Feature",
          geometry: data.routes[0].geometry,
        };

        if (map.current.getSource("route")) {
          map.current.getSource("route").setData(geoJson);
        } else {
          map.current.addSource("route", { type: "geojson", data: geoJson });
          map.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 5,
              "line-opacity": 0.8,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handlePickupFromStore = async () => {
    try {
      setIsUpdatingStatus(true);
      // First mark as picked_up
      await ordersAPI.updateOrderStatus(orderId, "picked_up");
      // Then immediately mark as on_the_way
      const response = await ordersAPI.updateOrderStatus(orderId, "on_the_way");
      const updatedOrder = response.data || response;
      setOrder(updatedOrder);
      toast.success("Order picked up! Now heading to customer.");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    try {
      setIsUpdatingStatus(true);
      await ordersAPI.updateOrderStatus(orderId, "delivered");
      toast.success("Order marked as delivered!");
      navigate("/");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-300"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-400">
        {error}
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-black overflow-hidden">
      {/* Map Section - 60% */}
      <div className="h-[60%] w-full relative">
        <MapView
          order={order}
          onMapReady={handleMapReady}
          isValidCoord={isValidCoord}
        />
        <StatusBadge status={order.status} />
      </div>

      {/* Order Details Section - 40% */}
      <div className="h-[40%] w-full bg-black shadow-lg rounded-t-2xl -mt-4 relative z-20 flex flex-col border-t border-white/10">
        {/* Drag Handle */}
        <div className="flex justify-center pt-2 pb-1.5">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {/* Route Details */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Navigation className="w-4 h-4 mr-1.5 text-blue-400" />
              Route Details
            </h2>
            <RouteCards order={order} />
          </div>

          {/* Order Items */}
          <OrderItemsList items={order.items} />

          {/* Total & Actions */}
          <ActionButtons
            order={order}
            isUpdatingStatus={isUpdatingStatus}
            onPickup={handlePickupFromStore}
            onMarkDelivered={handleMarkAsDelivered}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
