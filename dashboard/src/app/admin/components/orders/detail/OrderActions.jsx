import React from "react";
import { Edit, UserPlus, X, RefreshCw } from "lucide-react";

const OrderActions = ({ order, onUpdateStatus, onAssignRider, onCancel }) => {
  const canUpdateStatus = !["delivered", "cancelled"].includes(order.status);
  const canAssignRider =
    !order.riderId && !["cancelled", "delivered"].includes(order.status);
  const canCancel = !["delivered", "cancelled"].includes(order.status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="space-y-3">
        {canUpdateStatus && (
          <button
            onClick={onUpdateStatus}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Update Status
          </button>
        )}

        {canAssignRider && (
          <button
            onClick={onAssignRider}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Rider
          </button>
        )}

        {canCancel && (
          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Order
          </button>
        )}

        {!canUpdateStatus && !canAssignRider && !canCancel && (
          <p className="text-sm text-gray-500 text-center py-4">
            No actions available for this order
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderActions;
