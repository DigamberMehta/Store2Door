import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

const RejectOrderModal = ({ order, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [loading, setLoading] = useState(false);

  const commonReasons = [
    "Out of stock",
    "Store is too busy",
    "Cannot deliver to this location",
    "Suspicious/fraudulent order",
    "Store equipment malfunction",
    "Insufficient preparation time",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      return;
    }

    setLoading(true);
    await onSubmit({ reason, notifyCustomer });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Reject Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 flex items-start">
          <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-800">
            <p className="font-medium mb-0.5">
              Store cannot fulfill this order
            </p>
            <p>
              Rejecting will notify the customer and automatically process a
              full refund. This action cannot be undone.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Order Details
            </label>
            <div className="bg-gray-50 rounded-lg p-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium text-gray-900">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-gray-900">
                  R {order.total?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className="font-medium text-orange-600">
                  {order.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason for Rejection *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Select a reason...</option>
              {commonReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === "Other" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Specify Reason *
              </label>
              <textarea
                value={reason === "Other" ? "" : reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide the reason for rejection..."
                rows={3}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <p className="text-xs text-blue-800 font-medium mb-1">
              💰 Automatic Refund
            </p>
            <p className="text-xs text-blue-700">
              Customer will receive a full refund of R {order.total?.toFixed(2)}{" "}
              to their wallet since the store cannot fulfill the order.
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyCustomer"
              checked={notifyCustomer}
              onChange={(e) => setNotifyCustomer(e.target.checked)}
              className="w-3.5 h-3.5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label
              htmlFor="notifyCustomer"
              className="ml-2 text-xs text-gray-700"
            >
              Send notification to customer
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Rejecting..." : "Reject Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectOrderModal;
