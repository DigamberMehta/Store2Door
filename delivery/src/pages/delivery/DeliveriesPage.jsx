import HeroSection from "../../components/home/HeroSection";
import BottomNavigation from "../../components/home/BottomNavigation";
import { Package, MapPin, Store, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ordersAPI } from "../../services/api";
import { calculateDistance, formatDistance } from "../../utils/distance";
import socketService from "../../services/socket";

const DeliveriesPage = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);

  // Get driver's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setDriverLocation(location);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    } else {
      console.log("Geolocation not supported");
    }
  }, []);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await ordersAPI.getAvailableOrders();
        setDeliveries(response?.data?.orders || []);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();

    // Connect to socket for real-time updates
    const driverStr = localStorage.getItem("driver");
    if (driverStr) {
      const driver = JSON.parse(driverStr);
      const driverId = driver._id || driver.id;

      socketService.connect(driverId, "driver");

      // Listen for new available orders
      const handleNewOrder = () => {
        console.log("[DeliveriesPage] New order available, refreshing list");
        fetchDeliveries();
      };

      socketService.on("order:new-available", handleNewOrder);
      socketService.on("order:status-changed", handleNewOrder);

      // Listen for driver status changes
      const handleStatusChange = (event) => {
        console.log(
          "[DeliveriesPage] Driver status changed, refreshing orders",
        );
        fetchDeliveries();
      };

      window.addEventListener("driver:status-changed", handleStatusChange);

      return () => {
        socketService.off("order:new-available", handleNewOrder);
        socketService.off("order:status-changed", handleNewOrder);
        window.removeEventListener("driver:status-changed", handleStatusChange);
      };
    }
  }, []);

  // Calculate distances for a delivery
  const getDistances = (delivery) => {
    // Get store coordinates from address object
    const storeLat = delivery.storeId?.address?.latitude;
    const storeLng = delivery.storeId?.address?.longitude;

    // Get customer coordinates from deliveryAddress
    const customerLat = delivery.deliveryAddress?.latitude;
    const customerLng = delivery.deliveryAddress?.longitude;

    let driverToStore = null;
    let storeToCustomer = null;

    // Calculate driver to store distance
    if (driverLocation && storeLat && storeLng) {
      driverToStore = calculateDistance(
        driverLocation.lat,
        driverLocation.lng,
        storeLat,
        storeLng,
      );
    }

    // Calculate store to customer distance
    if (
      storeLat &&
      storeLng &&
      customerLat &&
      customerLng &&
      customerLat !== 0 &&
      customerLng !== 0
    ) {
      storeToCustomer = calculateDistance(
        storeLat,
        storeLng,
        customerLat,
        customerLng,
      );
      console.log("Store to customer distance:", storeToCustomer, "km");
    }

    return { driverToStore, storeToCustomer };
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white pb-24">
        <HeroSection />
        <div className="px-4 mt-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-4 h-40" />
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pb-24">
      <div className="relative">
        <HeroSection />
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-2xl font-bold">Available Deliveries</p>
          <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-full">
            {deliveries.length} orders
          </span>
        </div>

        {deliveries.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No deliveries available right now</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery._id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5 active:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-500/10 p-2 rounded-xl">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">
                      Order ID
                    </p>
                    <p className="text-xs font-mono text-white tracking-tighter">
                      {delivery.orderNumber}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Store className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                          {delivery.storeId?.name || "Store"}
                        </h3>
                        {(() => {
                          const { driverToStore } = getDistances(delivery);
                          return (
                            driverToStore !== null && (
                              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                {formatDistance(driverToStore)}
                              </span>
                            )
                          );
                        })()}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {delivery.storeId?.address?.street || ""},{" "}
                        {delivery.storeId?.address?.city || ""}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-medium mt-1">
                        Pickup point
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-zinc-300 leading-relaxed flex-1">
                          {delivery.deliveryAddress?.street},{" "}
                          {delivery.deliveryAddress?.city}
                        </p>
                        {(() => {
                          const { storeToCustomer } = getDistances(delivery);
                          return (
                            storeToCustomer !== null && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                                {formatDistance(storeToCustomer)}
                              </span>
                            )
                          );
                        })()}
                      </div>
                      <p className="text-[10px] text-emerald-400 mt-1 font-medium italic">
                        Destination
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/order-detail/${delivery._id}`)}
                  className="w-full mt-4 bg-emerald-500 py-3 rounded-xl text-sm font-bold text-black active:scale-[0.98] transition-all"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default DeliveriesPage;
