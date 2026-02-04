import { useState } from "react";
import { Bike, UserX, UserCheck, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { trackingAPI } from "../../../../../services/admin/api/tracking/tracking.api";
import RiderDetailView from "./components/RiderDetailView";
import RiderCard from "./components/RiderCard";
import AssignOrderModal from "./components/AssignOrderModal";

const RiderListSidebar = ({
  riders,
  selectedRider,
  onRiderSelect,
  stats,
  onOrderAssign,
  onTrackOrder,
}) => {
  const [activeTab, setActiveTab] = useState("free");
  const [assigningOrder, setAssigningOrder] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [unassigningOrder, setUnassigningOrder] = useState(false);

  const formatTime = (date) => {
    if (!date) return "N/A";
    const now = new Date();
    const lastActive = new Date(date);
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      assigned: "bg-orange-100 text-orange-700 border-orange-200",
      ready_for_pickup: "bg-yellow-100 text-yellow-700 border-yellow-200",
      picked_up: "bg-blue-100 text-blue-700 border-blue-200",
      on_the_way: "bg-purple-100 text-purple-700 border-purple-200",
      delivered: "bg-green-100 text-green-700 border-green-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const handleUnassignOrder = async () => {
    if (!selectedRider?.activeOrder) return;

    try {
      setUnassigningOrder(true);
      const response = await trackingAPI.unassignOrder(
        selectedRider.activeOrder._id,
      );

      if (response.success) {
        toast.success("Order unassigned successfully");
        onOrderAssign(); // Refresh data
        onRiderSelect(null); // Close detail view
      }
    } catch (error) {
      console.error("Error unassigning order:", error);
      toast.error(error.response?.data?.message || "Failed to unassign order");
    } finally {
      setUnassigningOrder(false);
    }
  };

  const handleAssignOrder = async (riderId) => {
    if (!selectedRider?.activeOrder) return;

    try {
      setAssigningOrder(true);
      const response = await trackingAPI.assignOrder(
        selectedRider.activeOrder._id,
        riderId,
      );

      if (response.success) {
        toast.success("Order assigned successfully");
        setShowAssignModal(false);
        onOrderAssign(); // Refresh data
      }
    } catch (error) {
      console.error("Error assigning order:", error);
      toast.error(error.response?.data?.message || "Failed to assign order");
    } finally {
      setAssigningOrder(false);
    }
  };

  // Filter riders based on active tab
  const offlineRiders = riders.filter((r) => !r.isAvailable);
  const freeRiders = riders.filter((r) => r.isAvailable && !r.activeOrder);
  const busyRiders = riders.filter((r) => r.isAvailable && r.activeOrder);

  const getFilteredRiders = () => {
    switch (activeTab) {
      case "offline":
        return offlineRiders;
      case "free":
        return freeRiders;
      case "busy":
        return busyRiders;
      default:
        return riders;
    }
  };

  const filteredRiders = getFilteredRiders();

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Show detailed view when rider is selected */}
        {selectedRider ? (
          <RiderDetailView
            rider={selectedRider}
            onBack={() => onRiderSelect(null)}
            formatTime={formatTime}
            getStatusColor={getStatusColor}
            onTrackOrder={onTrackOrder}
            onShowAssignModal={() => setShowAssignModal(true)}
            onUnassignOrder={handleUnassignOrder}
            unassigningOrder={unassigningOrder}
          />
        ) : (
          <>
            {/* Filters */}
            <div className="p-3 bg-white border-b border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("free")}
                  className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    activeTab === "free"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Free
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === "free"
                        ? "bg-white/20"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {freeRiders.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("busy")}
                  className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    activeTab === "busy"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Busy
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === "busy"
                        ? "bg-white/20"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {busyRiders.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("offline")}
                  className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    activeTab === "offline"
                      ? "bg-gray-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  Offline
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === "offline"
                        ? "bg-white/20"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {offlineRiders.length}
                  </span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredRiders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  {activeTab === "free" && (
                    <>
                      <UserCheck className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        No free riders
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        All available riders are busy
                      </p>
                    </>
                  )}
                  {activeTab === "busy" && (
                    <>
                      <TrendingUp className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        No busy riders
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        No riders currently on deliveries
                      </p>
                    </>
                  )}
                  {activeTab === "offline" && (
                    <>
                      <UserX className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        No offline riders
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        All riders are online
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredRiders.map((rider) => (
                    <RiderCard
                      key={rider._id}
                      rider={rider}
                      isSelected={selectedRider?._id === rider._id}
                      onClick={() => onRiderSelect(rider)}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Assignment Modal */}
      <AssignOrderModal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedRider={selectedRider}
        riders={riders}
        onAssignOrder={handleAssignOrder}
        assigningOrder={assigningOrder}
      />
    </>
  );
};

export default RiderListSidebar;
