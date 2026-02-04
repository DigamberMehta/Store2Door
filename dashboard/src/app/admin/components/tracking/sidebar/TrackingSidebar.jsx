import { useState } from "react";
import { Bike, X } from "lucide-react";
import RiderListSidebar from "./RiderListSidebar";
import OrderTrackingPanel from "./OrderTrackingPanel";

const TrackingSidebar = ({
  riders,
  orders,
  selectedRider,
  selectedOrder,
  onRiderSelect,
  onOrderSelect,
  stats,
  onOrderAssign,
}) => {
  const [showTrackingPanel, setShowTrackingPanel] = useState(false);

  const handleOrderSelect = (order) => {
    onOrderSelect(order);
    setShowTrackingPanel(true);
  };

  return (
    <div className="flex h-screen">
      {/* Main Sidebar */}
      <div className="w-95 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Active Riders</h2>
            {riders && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <Bike className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {riders.filter((r) => r.isAvailable).length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Riders Content */}
        <div className="flex-1 overflow-hidden">
          <RiderListSidebar
            riders={riders}
            selectedRider={selectedRider}
            onRiderSelect={onRiderSelect}
            stats={stats}
            onOrderAssign={onOrderAssign}
            onTrackOrder={handleOrderSelect}
          />
        </div>
      </div>

      {/* Tracking Details Panel (Slides in from right) */}
      {showTrackingPanel && selectedOrder && (
        <div className="w-96 bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ease-out animate-in slide-in-from-right">
          <div className="relative h-full">
            <button
              onClick={() => setShowTrackingPanel(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
              title="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            <OrderTrackingPanel order={selectedOrder} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingSidebar;
