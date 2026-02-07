import React from "react";

const OrderStatusBadge = ({ status, paymentStatus, size = "md" }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    placed: "bg-blue-100 text-blue-800 border-blue-200",
    confirmed: "bg-indigo-100 text-indigo-800 border-indigo-200",
    preparing: "bg-purple-100 text-purple-800 border-purple-200",
    ready_for_pickup: "bg-pink-100 text-pink-800 border-pink-200",
    assigned: "bg-cyan-100 text-cyan-800 border-cyan-200",
    picked_up: "bg-teal-100 text-teal-800 border-teal-200",
    on_the_way: "bg-orange-100 text-orange-800 border-orange-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-orange-100 text-orange-800 border-orange-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${
        statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
      } ${sizeClasses[size]}`}
    >
      {status.replace(/_/g, " ").toUpperCase()}
    </span>
  );
};

export default OrderStatusBadge;
