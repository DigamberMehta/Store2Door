import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

const CancelOrderModal = ({ order, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(order.total || 0);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      return;
    }

    setLoading(true);
    await onSubmit({ reason, refundAmount, notifyCustomer });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Cancel Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-start">
          <AlertTriangle className="w-4 h-4 text-red-600 mr-2 shrink-0 mt-0.5" />
          <div className="text-xs text-red-800">
            <p className="font-medium mb-0.5">
              Warning: This action cannot be undone
            </p>
            <p>
              Cancelling this order will mark it as cancelled and optionally
              process a refund for the customer.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="Provide a detailed reason for cancellation..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Refund Amount (R)
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
              min="0"
              max={order.total}
              step="0.01"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Order total: R {order.total?.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyCustomer"
              checked={notifyCustomer}
              onChange={(e) => setNotifyCustomer(e.target.checked)}
              className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label
              htmlFor="notifyCustomer"
              className="ml-2 text-xs text-gray-700"
            >
              Notify customer about cancellation
            </label>
          </div>

          <div className="flex space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Go Back
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
            >
              {loading ? "Cancelling..." : "Cancel Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;
