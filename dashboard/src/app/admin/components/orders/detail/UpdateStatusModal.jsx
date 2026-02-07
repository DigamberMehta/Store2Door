import React, { useState } from "react";
import { X } from "lucide-react";

const UpdateStatusModal = ({ order, onClose, onSubmit }) => {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "placed", label: "Placed" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready_for_pickup", label: "Ready for Pickup" },
    { value: "assigned", label: "Assigned" },
    { value: "picked_up", label: "Picked Up" },
    { value: "on_the_way", label: "On the Way" },
    { value: "delivered", label: "Delivered" },
    { value: "refunded", label: "Refunded" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ status, notes, notifyCustomer });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            Update Order Status
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              New Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add any notes about this status update..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyCustomer"
              checked={notifyCustomer}
              onChange={(e) => setNotifyCustomer(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="notifyCustomer"
              className="ml-2 text-xs text-gray-700"
            >
              Notify customer about this update
            </label>
          </div>

          <div className="flex space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
