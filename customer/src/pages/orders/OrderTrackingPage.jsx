import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { ArrowLeft, Package, MapPin, Store, Phone, Clock } from "lucide-react";
import { getOrderById } from "../../services/api/order.api";
import socketService from "../../services/socket";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGlnYW1iZXIyNjAzIiwiYSI6ImNseHQzN3UwYTBtZDUyaXBlMXR3eDd1bnEifQ.RDplt9ho8x1WPhRwIi_IzQ";

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarker = useRef(null);

  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update route on map
  const updateRoute = async (driverLoc) => {
    if (!map.current || !order) return;

    const storeCoords = [
      order.storeId?.address?.longitude || 0,
      order.storeId?.address?.latitude || 0,
    ];

    const customerCoords = [
      order.deliveryAddress?.longitude || 0,
      order.deliveryAddress?.latitude || 0,
    ];

    // Determine destination based on order status
    let destination;
    if (
      ["assigned", "ready_for_pickup", "confirmed", "preparing"].includes(
        order.status,
      )
    ) {
      // Driver is going to store
      destination = storeCoords;
    } else if (["picked_up", "on_the_way"].includes(order.status)) {
      // Driver is going to customer
      destination = customerCoords;
    } else {
      return; // No route needed for other statuses
    }

    if (!driverLoc || destination[0] === 0 || destination[1] === 0) return;

    try {
      const coords = `${driverLoc[0]},${driverLoc[1]};${destination[0]},${destination[1]}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry;

        // Remove old route layer and source if exists
        if (map.current.getLayer("route")) {
          map.current.removeLayer("route");
        }
        if (map.current.getSource("route")) {
          map.current.removeSource("route");
        }

        // Add new route
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route,
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(orderId);
        const orderData = response.data || response;

        if (orderData) {
          setOrder(orderData);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Debug: Log when order status changes
  useEffect(() => {
    if (order) {
      console.log(
        "[OrderTracking] Order state updated, current status:",
        order.status,
      );

      // Redirect to delivered page when order is delivered
      if (order.status === "delivered") {
        setTimeout(() => {
          navigate(`/orders/${orderId}/delivered`, {
            state: { order },
            replace: true,
          });
        }, 2000); // Give 2 seconds to see the final status update
      }
    }
  }, [order?.status, orderId, navigate, order]);

  // Initialize map
  useEffect(() => {
    if (!order || map.current) return;

    const storeCoords = [
      order.storeId?.address?.longitude || 0,
      order.storeId?.address?.latitude || 0,
    ];

    const customerCoords = [
      order.deliveryAddress?.longitude || 0,
      order.deliveryAddress?.latitude || 0,
    ];

    const initialCenter =
      customerCoords[0] !== 0 ? customerCoords : storeCoords;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add store marker
    if (storeCoords[0] !== 0) {
      const storeEl = document.createElement("div");
      storeEl.style.cssText = `
        width: 45px;
        height: 45px;
        background-image: url(https://cdn-icons-png.flaticon.com/512/6395/6395603.png);
        background-size: cover;
        background-position: center;
        cursor: pointer;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      `;

      new mapboxgl.Marker({ element: storeEl, anchor: "bottom" })
        .setLngLat(storeCoords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="font-weight:bold;color:#1f2937">${order.storeId?.name || "Store"}</div>`,
          ),
        )
        .addTo(map.current);
    }

    // Add customer marker
    if (customerCoords[0] !== 0) {
      const customerEl = document.createElement("div");
      customerEl.style.cssText = `
        width: 45px;
        height: 45px;
        background-image: url(https://cdn-icons-png.flaticon.com/512/1189/1189458.png);
        background-size: cover;
        background-position: center;
        cursor: pointer;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      `;

      new mapboxgl.Marker({ element: customerEl, anchor: "bottom" })
        .setLngLat(customerCoords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="font-weight:bold;color:#1f2937">Delivery Location</div>`,
          ),
        )
        .addTo(map.current);
    }

    // Driver marker (will be updated via socket)
    const driverEl = document.createElement("div");
    driverEl.style.cssText = `
      width: 50px;
      height: 50px;
      background-image: url(https://png.pngtree.com/png-vector/20220327/ourmid/pngtree-big-isolated-motorcycle-vector-colorful-icons-set-flat-illustrations-of-various-png-image_4517043.png);
      background-size: cover;
      background-position: center;
      cursor: pointer;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    `;

    driverMarker.current = new mapboxgl.Marker({
      element: driverEl,
      anchor: "bottom",
    });

    // If driver is assigned and has location, show marker immediately
    if (order.riderId && order.driverLocation) {
      const { latitude, longitude } = order.driverLocation;
      console.log("Initial driver location from order:", {
        latitude,
        longitude,
        riderId: order.riderId,
      });
      if (latitude && longitude) {
        driverMarker.current
          .setLngLat([longitude, latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="font-weight:bold;color:#1f2937">Driver</div>`,
            ),
          )
          .addTo(map.current);

        console.log("Driver marker added to map");

        // Fit bounds to show all markers
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([longitude, latitude]);
        if (storeCoords[0] !== 0) bounds.extend(storeCoords);
        if (customerCoords[0] !== 0) bounds.extend(customerCoords);
        map.current.fitBounds(bounds, { padding: 50 });
      }
    } else {
      console.log("No driver location:", {
        hasRider: !!order.riderId,
        hasLocation: !!order.driverLocation,
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [order]);

  // Socket.IO connection and real-time updates
  useEffect(() => {
    console.log(
      "[OrderTracking] Socket useEffect triggered, orderId:",
      orderId,
    );

    if (!orderId) {
      console.warn("[OrderTracking] No orderId, skipping socket setup");
      return;
    }

    // Get user ID from localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.warn(
        "[OrderTracking] No user in localStorage, skipping socket setup",
      );
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user._id || user.id;

    if (!userId) {
      console.warn(
        "[OrderTracking] No userId found in user object, skipping socket setup",
      );
      return;
    }

    console.log("[OrderTracking] Setting up socket with userId:", userId);

    // Connect socket
    const socket = socketService.connect(userId, "customer");

    if (!socket) {
      console.error("[OrderTracking] Failed to create socket connection");
      return;
    }

    console.log(
      "[OrderTracking] Socket instance created, connected:",
      socket.connected,
    );

    // Wait for connection before joining room
    const onConnect = () => {
      console.log("[OrderTracking] Socket connected, joining order room");
      socketService.joinOrderTracking(orderId, userId);
    };

    const onDisconnect = () => {
      console.log("[OrderTracking] Socket disconnected");
    };

    if (socket.connected) {
      console.log("[OrderTracking] Socket already connected");
      onConnect();
    } else {
      console.log("[OrderTracking] Waiting for socket to connect...");
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
    }

    // Listen for driver location updates
    const handleDriverLocation = ({ location }) => {
      console.log("[OrderTracking] Received driver location:", location);
      if (location && map.current && driverMarker.current) {
        const { latitude, longitude } = location;
        setDriverLocation(location);

        let wasOnMap = false;
        try {
          wasOnMap = driverMarker.current.getLngLat() !== undefined;
        } catch (e) {
          // Marker not yet added
          wasOnMap = false;
        }

        // Update driver marker
        driverMarker.current
          .setLngLat([longitude, latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="font-weight:bold;color:#1f2937">Driver</div>`,
            ),
          )
          .addTo(map.current);

        console.log("Driver marker updated:", longitude, latitude);

        // Update route
        updateRoute([longitude, latitude]);

        // Only auto-center on first location update
        if (!wasOnMap) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 1000,
          });
        }
      } else {
        console.log("Missing:", {
          location,
          hasMap: !!map.current,
          hasMarker: !!driverMarker.current,
        });
      }
    };

    // Listen for order status changes
    const handleStatusChange = ({ status, trackingHistory }) => {
      console.log(
        "[OrderTracking] Status changed via socket:",
        status,
        trackingHistory,
      );
      setOrder((prev) => {
        console.log("[OrderTracking] Previous order status:", prev?.status);
        const updated = {
          ...prev,
          status,
          trackingHistory: trackingHistory || prev.trackingHistory,
        };
        console.log("[OrderTracking] Updated order status:", updated.status);

        // Update route when status changes (if driver location is available)
        if (driverMarker.current) {
          try {
            const currentDriverLoc = driverMarker.current.getLngLat();
            if (currentDriverLoc) {
              setTimeout(() => {
                updateRoute([currentDriverLoc.lng, currentDriverLoc.lat]);
              }, 100);
            }
          } catch (e) {
            // Marker not on map yet
          }
        }

        return updated;
      });
    };

    socketService.onDriverLocationUpdate(handleDriverLocation);
    socketService.onOrderStatusChange(handleStatusChange);

    // Cleanup
    return () => {
      if (socket) {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      }
      socketService.offDriverLocationUpdate();
      socketService.offOrderStatusChange();
      socketService.leaveOrderTracking(orderId);
    };
  }, [orderId]);

  const getStatusText = () => {
    switch (order?.status) {
      case "confirmed":
        return "Order Confirmed";
      case "preparing":
        return "Store is Preparing";
      case "ready_for_pickup":
        return "Ready for Pickup";
      case "assigned":
        return "Driver Assigned";
      case "picked_up":
        return "Driver Picked Up";
      case "on_the_way":
        return "On the Way to You";
      case "delivered":
        return "Delivered";
      default:
        return "Processing";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black p-4">
        <p className="text-red-400 mb-4">{error || "Order not found"}</p>
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-black border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-white">Track Order</h1>
          <p className="text-sm text-zinc-400">#{order.orderNumber}</p>
        </div>
      </div>

      {/* Map - 60% */}
      <div className="h-[60%] relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-white">
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Order Details - 40% */}
      <div className="h-[40%] bg-black overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Tracking Timeline */}
          <div className="bg-white/5 rounded-lg p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-white">
              <Clock size={18} />
              Tracking History
            </h2>
            <div className="space-y-3">
              {order.trackingHistory
                ?.slice()
                .reverse()
                .map((track, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          idx === 0 ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      {idx !== order.trackingHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-sm capitalize text-white">
                        {track.status.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {new Date(track.updatedAt).toLocaleString()}
                      </p>
                      {track.notes && (
                        <p className="text-xs text-zinc-500 mt-1">
                          {track.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Store Info */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-white">
              <Store size={18} className="text-orange-400" />
              Store
            </h3>
            <p className="font-medium text-white">{order.storeId?.name}</p>
            <p className="text-sm text-zinc-400">
              {order.storeId?.address?.street}
            </p>
          </div>

          {/* Delivery Address */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-white">
              <MapPin size={18} className="text-green-400" />
              Delivery Address
            </h3>
            <p className="text-sm text-white">
              {order.deliveryAddress?.street}
            </p>
            <p className="text-sm text-zinc-400">
              {order.deliveryAddress?.city}, {order.deliveryAddress?.province}
            </p>
          </div>

          {/* Items */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-white">
              <Package size={18} />
              Items ({order.items?.length})
            </h3>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm text-white"
                >
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">
                    R{(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-3 pt-3">
              <div className="flex justify-between font-bold text-white">
                <span>Total</span>
                <span>R{order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
