import React from "react";
import { Clock, CheckCircle, Circle } from "lucide-react";

const OrderTimeline = ({ trackingHistory = [] }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-ZA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-100",
      placed: "text-blue-600 bg-blue-100",
      confirmed: "text-indigo-600 bg-indigo-100",
      preparing: "text-purple-600 bg-purple-100",
      ready_for_pickup: "text-pink-600 bg-pink-100",
      assigned: "text-cyan-600 bg-cyan-100",
      picked_up: "text-teal-600 bg-teal-100",
      on_the_way: "text-orange-600 bg-orange-100",
      delivered: "text-green-600 bg-green-100",
      cancelled: "text-red-600 bg-red-100",
    };
    return colors[status] || "text-gray-600 bg-gray-100";
  };

  if (!trackingHistory || trackingHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <Clock className="w-5 h-5 mr-2" />
          Order Timeline
        </h2>
        <p className="text-sm text-gray-500">No tracking history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <Clock className="w-5 h-5 mr-2" />
        Order Timeline
      </h2>
      <div className="flow-root">
        <ul className="-mb-8">
          {trackingHistory.map((event, idx) => {
            const isLast = idx === trackingHistory.length - 1;
            return (
              <li key={idx}>
                <div className="relative pb-8">
                  {!isLast && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(
                          event.status,
                        )}`}
                      >
                        {idx === 0 ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Circle className="h-3 w-3" fill="currentColor" />
                        )}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.status.replace(/_/g, " ").toUpperCase()}
                        </p>
                        {event.notes && (
                          <p className="mt-0.5 text-sm text-gray-600">
                            {event.notes}
                          </p>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        {formatDate(event.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default OrderTimeline;
