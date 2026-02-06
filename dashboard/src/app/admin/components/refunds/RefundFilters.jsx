import React from "react";
import { Search, Filter, X, Download } from "lucide-react";

const RefundFilters = ({ filters, onFilterChange, onExport, loading }) => {
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending_review", label: "Pending Review" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ];

  const reasonOptions = [
    { value: "", label: "All Reasons" },
    { value: "not_delivered", label: "Not Delivered" },
    { value: "delivered_wrong_items", label: "Wrong Items" },
    { value: "delivered_damaged_items", label: "Damaged Items" },
    { value: "delivered_incomplete_order", label: "Incomplete Order" },
    { value: "quality_issue", label: "Quality Issue" },
    { value: "late_delivery", label: "Late Delivery" },
    { value: "delivery_mishap", label: "Delivery Mishap" },
    { value: "customer_cancelled", label: "Customer Cancelled" },
    { value: "store_cancelled", label: "Store Cancelled" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  const handleClearFilters = () => {
    onFilterChange({
      status: "",
      refundReason: "",
      dateFrom: "",
      dateTo: "",
      search: "",
      page: 1,
      limit: 20,
    });
  };

  const hasActiveFilters =
    filters.status ||
    filters.refundReason ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
      {/* Search and Actions Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by refund number or customer note..."
              value={filters.search || ""}
              onChange={(e) => handleChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center px-3 py-1.5 text-gray-700 hover:text-gray-900 text-sm"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reason Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Reason
          </label>
          <select
            value={filters.refundReason || ""}
            onChange={(e) => handleChange("refundReason", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => handleChange("dateFrom", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => handleChange("dateTo", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default RefundFilters;
