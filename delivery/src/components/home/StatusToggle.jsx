import { useState, useEffect, useRef } from "react";
import { driverProfileAPI } from "../../services/api";
import socketService from "../../services/socket";
import toast from "react-hot-toast";

const StatusToggle = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const locationIntervalRef = useRef(null);

  // Fetch initial status from backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await driverProfileAPI.getProfile();
        setIsOnline(response?.data?.profile?.isAvailable || false);
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // Periodic location updates when online
  useEffect(() => {
    if (isOnline) {
      // Update immediately
      updateDriverLocation();

      // Update every 30 seconds while online
      locationIntervalRef.current = setInterval(() => {
        updateDriverLocation();
      }, 30000);
    } else {
      // Clear interval when offline
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [isOnline]);

  const updateDriverLocation = async () => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await driverProfileAPI.updateLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              console.log("Location updated successfully");
              resolve(true);
            } catch (error) {
              console.error("Error updating location:", error);
              resolve(false);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      } else {
        console.log("Geolocation not supported");
        resolve(false);
      }
    });
  };

  const handleToggle = async () => {
    const newStatus = !isOnline;
    const previousStatus = isOnline;

    // Optimistic update - change UI immediately
    setIsOnline(newStatus);
    toast.success(`You are now ${newStatus ? "online" : "offline"}`, {
      duration: 2000,
    });

    try {
      await driverProfileAPI.toggleOnlineStatus(newStatus);

      // Update location if going online
      if (newStatus) {
        await updateDriverLocation();
      }

      // Notify socket server about availability change
      const driverStr = localStorage.getItem("driver");
      if (driverStr) {
        const driver = JSON.parse(driverStr);
        const driverId = driver._id || driver.id;

        if (socketService.socket && socketService.isConnected) {
          socketService.socket.emit("driver:availability-update", {
            driverId,
            isAvailable: newStatus,
          });
          console.log(`Sent availability update to socket: ${newStatus}`);
        }
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("driver:status-changed", {
          detail: { isAvailable: newStatus },
        }),
      );
    } catch (error) {
      // Revert to previous state on error
      setIsOnline(previousStatus);
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mx-2 mt-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative z-10 border border-white/5 animate-pulse">
        <div className="h-12 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mx-2 mt-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative z-10 border border-white/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Status:{" "}
            <span className={isOnline ? "text-emerald-400" : "text-zinc-400"}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">
            {isOnline ? "Open to any delivery" : "Not accepting deliveries"}
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full transition-all duration-500 ease-in-out focus:outline-none select-none ${
            isOnline
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "bg-white/10"
          }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
              isOnline ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default StatusToggle;
