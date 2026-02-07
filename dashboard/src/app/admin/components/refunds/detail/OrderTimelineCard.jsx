import React from "react";
import { Clock, AlertCircle, XCircle, Calendar } from "lucide-react";

const OrderTimelineCard = ({ order }) => {
  if (
    !order?.rejectedBy &&
    !order?.cancelledBy &&
    (!order?.trackingHistory || order.trackingHistory.length === 0)
  ) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-amber-600" />
        Order Timeline
      </h3>

      {/* Rejection/Cancellation Info */}
      {order.rejectedBy && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900 text-sm">
                Order Rejected
              </p>
              <p className="text-xs text-orange-800 mt-1">
                By: {order.rejectedBy.name} ({order.rejectedBy.role})
              </p>
              {order.rejectedAt && (
                <p className="text-xs text-orange-700">
                  {new Date(order.rejectedAt).toLocaleString("en-ZA")}
                </p>
              )}
              {order.rejectionReason && (
                <p className="text-xs text-orange-900 mt-1 italic">
                  "{order.rejectionReason}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {order.cancelledBy && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 text-sm">
                Order Cancelled
              </p>
              <p className="text-xs text-red-800 mt-1">
                By: {order.cancelledBy.name} ({order.cancelledBy.role})
              </p>
              {order.cancelledAt && (
                <p className="text-xs text-red-700">
                  {new Date(order.cancelledAt).toLocaleString("en-ZA")}
                </p>
              )}
              {order.cancellationReason && (
                <p className="text-xs text-red-900 mt-1 italic">
                  "{order.cancellationReason}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tracking History */}
      {order.trackingHistory && order.trackingHistory.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            Status History:
          </p>
          {order.trackingHistory
            .slice()
            .reverse()
            .map((track, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-gray-600 pl-3 border-l-2 border-gray-300 py-1"
              >
                <Calendar className="w-3 h-3 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-900 capitalize">
                    {track.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {track.updatedAt
                      ? new Date(track.updatedAt).toLocaleString("en-ZA")
                      : "Invalid Date"}
                  </span>
                  {track.details && (
                    <p className="text-gray-600 mt-0.5">{track.details}</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default OrderTimelineCard;
