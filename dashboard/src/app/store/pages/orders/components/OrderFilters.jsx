import { Search, Filter, Calendar } from "lucide-react";

const OrderFilters = ({ filters, setFilters, onSearch }) => {
  const handleChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search order number..."
            value={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filters.status || ""}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm appearance-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="picked_up">Picked Up</option>
            <option value="on_the_way">On the Way</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filters.paymentStatus || ""}
            onChange={(e) => handleChange("paymentStatus", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm appearance-none bg-white"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filters.dateRange || ""}
            onChange={(e) => {
              const value = e.target.value;
              handleChange("dateRange", value);

              const today = new Date();
              let startDate = null;

              if (value === "today") {
                startDate = new Date(today.setHours(0, 0, 0, 0));
              } else if (value === "week") {
                startDate = new Date(today.setDate(today.getDate() - 7));
              } else if (value === "month") {
                startDate = new Date(today.setMonth(today.getMonth() - 1));
              }

              handleChange("startDate", startDate?.toISOString().split("T")[0]);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm appearance-none bg-white"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onSearch}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            setFilters({});
            onSearch();
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default OrderFilters;
