import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeAPI } from "../../../../services/store/api/store.api.js";
import {
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

const StoreOperationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [tempCloseReason, setTempCloseReason] = useState("");
  const [showTempCloseModal, setShowTempCloseModal] = useState(false);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getMy();
      if (response.success) {
        setStoreData(response.data);
        setTempCloseReason(response.data.temporaryCloseReason || "");
      }
    } catch (error) {
      console.error("Failed to fetch store data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTempClose = async (close) => {
    if (close && !tempCloseReason.trim()) {
      alert("Please provide a reason for temporarily closing your store");
      return;
    }

    try {
      setUpdating(true);
      const response = await storeAPI.updateTempClosure({
        isTemporarilyClosed: close,
        temporaryCloseReason: close ? tempCloseReason : "",
      });

      if (response.success) {
        setStoreData(response.data);
        setShowTempCloseModal(false);
        if (!close) setTempCloseReason("");
      }
    } catch (error) {
      console.error("Failed to update temporary closure:", error);
      alert("Failed to update store status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const isOpenNow = storeData?.operatingHours
    ? checkIfOpen(storeData.operatingHours)
    : false;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Operations</h1>
        <p className="text-gray-600 mt-1">
          Manage your store's operational status
        </p>
      </div>

      {/* Current Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Operating Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            {isOpenNow ? (
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Power className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <PowerOff className="w-5 h-5 text-gray-600" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Operating Status</p>
              <p className="font-semibold text-gray-900">
                {isOpenNow ? "Currently Open" : "Currently Closed"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Based on your operating hours schedule
          </p>
        </div>

        {/* Store Active Status (View Only) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            {storeData?.isActive ? (
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Store Status</p>
              <p className="font-semibold text-gray-900">
                {storeData?.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Managed by platform administrators
          </p>
        </div>

        {/* Approval Status (View Only) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            {storeData?.isApproved ? (
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Approval Status</p>
              <p className="font-semibold text-gray-900">
                {storeData?.isApproved ? "Approved" : "Pending Approval"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Verified by platform administrators
          </p>
        </div>
      </div>

      {/* Temporary Closure Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Temporary Closure
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Temporarily close your store for maintenance, vacation, or other
              reasons
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              storeData?.isTemporarilyClosed
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {storeData?.isTemporarilyClosed
              ? "Temporarily Closed"
              : "Open for Business"}
          </div>
        </div>

        {storeData?.isTemporarilyClosed ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">
                    Your store is temporarily closed
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    <span className="font-medium">Reason:</span>{" "}
                    {storeData.temporaryCloseReason}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggleTempClose(false)}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {updating ? "Reopening..." : "Reopen Store"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowTempCloseModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Temporarily Close Store
          </button>
        )}
      </div>

      {/* Suspension Status (View Only) */}
      {storeData?.isSuspended && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">
                Store Suspended
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Your store has been suspended by platform administrators
              </p>
            </div>
          </div>

          <div className="space-y-3 ml-13">
            <div>
              <p className="text-sm font-medium text-red-900">
                Suspension Reason:
              </p>
              <p className="text-sm text-red-700 mt-1">
                {storeData.suspensionReason}
              </p>
            </div>
            {storeData.suspendedAt && (
              <div>
                <p className="text-sm font-medium text-red-900">
                  Suspended On:
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {new Date(storeData.suspendedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">
                  Please contact platform support to resolve this issue and
                  reactivate your store.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Close Modal */}
      {showTempCloseModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Temporarily Close Store
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for closing your store. This will be
              visible to customers.
            </p>
            <textarea
              value={tempCloseReason}
              onChange={(e) => setTempCloseReason(e.target.value)}
              placeholder="e.g., Closed for maintenance, On vacation until..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              {tempCloseReason.length}/300 characters
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTempCloseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleTempClose(true)}
                disabled={updating || !tempCloseReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {updating ? "Closing..." : "Close Store"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to check if store is currently open
const checkIfOpen = (operatingHours) => {
  const now = new Date();
  const currentDay = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const currentTime = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = operatingHours.find((h) => h.day === currentDay);
  if (!todayHours || !todayHours.isOpen) return false;

  return (
    currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
  );
};

export default StoreOperationsPage;
