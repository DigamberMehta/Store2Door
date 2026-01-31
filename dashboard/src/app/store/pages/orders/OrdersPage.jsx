import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
} from "lucide-react";
import OrderFilters from "./components/OrderFilters";
import OrderCard from "./components/OrderCard";
import OrdersStats from "./components/OrdersStats";
import socketService from "../../../../services/socket";
import {
  getOrders,
  getOrderStats,
} from "../../../../services/store/api/ordersApi";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchStats();

    // Set up socket connection
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId = user._id || user.id;
        const storeId = user.storeId;

        console.log(
          "[OrdersPage] Connecting socket for user:",
          userId,
          "store:",
          storeId,
        );
        socketService.connect(userId, "store");

        // Listen for new orders
        socketService.onNewOrder((data) => {
          console.log("[OrdersPage] New order received:", data);

          // Only add if order is for this store
          if (
            data.storeId === storeId ||
            data.order?.storeId?._id === storeId
          ) {
            setOrders((prevOrders) => [data.order, ...prevOrders]);
            fetchStats(); // Refresh stats

            // Show notification
            if (Notification.permission === "granted") {
              new Notification("New Order!", {
                body: `Order ${data.order.orderNumber} received`,
                icon: "/logo.png",
              });
            }
          }
        });

        // Listen for order status changes
        socketService.onOrderStatusChanged((data) => {
          console.log("[OrdersPage] Order status changed:", data);

          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === data.orderId
                ? {
                    ...order,
                    status: data.status,
                    trackingInfo: data.trackingData,
                  }
                : order,
            ),
          );
          fetchStats(); // Refresh stats
        });
      } catch (err) {
        console.error(
          "[OrdersPage] Error parsing user or setting up socket:",
          err,
        );
      }
    }

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      socketService.offNewOrder();
      socketService.offOrderStatusChanged();
    };
  }, []);

  const fetchData = useCallback(
    async (page = 1) => {
      try {
        // Only show main loading on first load (page 1)
        if (page === 1) {
          setLoading(true);
        } else {
          setIsPaginationLoading(true);
        }
        setError(null);

        const response = await getOrders({ ...filters, page, limit: 20 });

        if (response.success) {
          setOrders(response.data.orders);
          setPagination(response.data.pagination);
          setCurrentPage(page);
        } else {
          setError(response.message || "Failed to load orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
        setIsPaginationLoading(false);
      }
    },
    [filters],
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await getOrderStats();
      if (response.success) {
        // Process stats
        const statusStats = {};
        response.data.byStatus.forEach((stat) => {
          statusStats[stat._id] = stat.count;
        });
        statusStats.total = response.data.byStatus.reduce(
          (sum, stat) => sum + stat.count,
          0,
        );
        setStats(statusStats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  const handleSearch = useCallback(() => {
    fetchData(1);
  }, [fetchData]);

  const handlePageChange = useCallback(
    (page) => {
      fetchData(page);
    },
    [fetchData],
  );

  if (loading && orders.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-800 font-medium">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Orders</h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage your store orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => fetchData(currentPage)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4">
        <OrdersStats stats={stats} />
      </div>

      {/* Filters */}
      <div className="px-4 mb-4">
        <OrderFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />
      </div>

      {/* Orders Grid/List */}
      <div className="px-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 font-medium">No orders found</p>
            <p className="text-sm text-gray-500 mt-1">
              Orders will appear here once customers place them
            </p>
          </div>
        ) : (
          <>
            {isPaginationLoading ? (
              viewMode === "grid" ? (
                // Shimmer effect for grid view
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="h-5 bg-gray-200 rounded w-24"></div>
                          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Shimmer effect for list view
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Items
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...Array(5)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {orders.map((order) => (
                      <OrderCard key={order._id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Order ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Items
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => {
                          const statusColors = {
                            pending: "bg-gray-100 text-gray-800",
                            placed: "bg-blue-100 text-blue-800",
                            confirmed: "bg-indigo-100 text-indigo-800",
                            preparing: "bg-yellow-100 text-yellow-800",
                            ready_for_pickup: "bg-purple-100 text-purple-800",
                            assigned: "bg-cyan-100 text-cyan-800",
                            picked_up: "bg-orange-100 text-orange-800",
                            on_the_way: "bg-teal-100 text-teal-800",
                            delivered: "bg-green-100 text-green-800",
                            cancelled: "bg-red-100 text-red-800",
                          };

                          return (
                            <tr
                              key={order._id}
                              className="hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() =>
                                (window.location.href = `/store/orders/${order._id}`)
                              }
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-900">
                                  {order.orderNumber}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm text-gray-700">
                                  {order.customerId?.name || "Unknown"}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm text-gray-700">
                                  {order.items?.length || 0} items
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-900">
                                  R{order.total?.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    statusColors[order.status] ||
                                    "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {order.status?.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    order.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/store/orders/${order._id}`;
                                  }}
                                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {orders.length} of {pagination.totalCount} orders
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
