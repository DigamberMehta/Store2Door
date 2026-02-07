import React from "react";
import { Eye, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";

const RefundTable = ({
  refunds,
  pagination,
  onPageChange,
  onRefundClick,
  loading,
}) => {
  const getStatusBadge = (status) => {
    const statusColors = {
      pending_review: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      processing: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace(/_/g, " ").toUpperCase()}
      </span>
    );
  };

  const getReasonLabel = (reason) => {
    const reasonLabels = {
      not_delivered: "Not Delivered",
      delivered_wrong_items: "Wrong Items",
      delivered_damaged_items: "Damaged Items",
      delivered_incomplete_order: "Incomplete Order",
      quality_issue: "Quality Issue",
      late_delivery: "Late Delivery",
      delivery_mishap: "Delivery Mishap",
      customer_cancelled: "Customer Cancelled",
      store_cancelled: "Store Cancelled",
      other: "Other",
    };
    return reasonLabels[reason] || reason;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!refunds || refunds.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <DollarSign className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-1">
            No refunds found
          </h3>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Refund #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Approved Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {refunds.map((refund) => (
              <tr
                key={refund._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRefundClick(refund)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {refund.refundNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {refund.orderId?.orderNumber || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {refund.customerId?.profilePhoto ? (
                      <img
                        src={refund.customerId.profilePhoto}
                        alt=""
                        className="h-8 w-8 rounded-full mr-3"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-gray-600">
                          {refund.customerId?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {refund.customerId?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {refund.customerId?.email || ""}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(refund.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getReasonLabel(refund.refundReason)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {refund.approvedAmount
                      ? `R ${refund.approvedAmount.toFixed(2)}`
                      : "Pending"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(refund.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefundClick(refund);
                    }}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} refunds
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundTable;
