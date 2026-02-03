import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import DriverMap from "../../components/tracking/map/DriverMap";
import RiderListSidebar from "../../components/tracking/sidebar/RiderListSidebar";
import { trackingAPI } from "../../../../services/admin/api/tracking";

const TrackingPage = () => {
  const [riders, setRiders] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch riders data
  const fetchRiders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);

      const [ridersResponse, statsResponse] = await Promise.all([
        trackingAPI.getActiveRiders(false),
        trackingAPI.getRiderStats(),
      ]);

      if (ridersResponse.success) {
        setRiders(ridersResponse.data.riders || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching riders:", error);
      toast.error("Failed to load rider data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRiders();
  }, []);

  // Auto refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRiders(false);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRiderSelect = (rider) => {
    setSelectedRider(rider);
  };

  const handleRefresh = () => {
    fetchRiders(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rider locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <RiderListSidebar
        riders={riders}
        selectedRider={selectedRider}
        onRiderSelect={handleRiderSelect}
        stats={stats}
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
    </div>
  );
};

export default TrackingPage;
