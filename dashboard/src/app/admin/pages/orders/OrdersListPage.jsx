import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import OrderStatsCards from "../../components/orders/OrderStatsCards";
import OrderFilters from "../../components/orders/OrderFilters";
import OrderTable from "../../components/orders/OrderTable";
import { ordersAPI } from "../../../../services/admin/api/orders.api";
import toast from "react-hot-toast";

const OrdersListPage = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [attention, setAttention] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 20,
  });

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll(filters);
      if (response.success) {
        setOrders(response.data.orders);
        setStats(response.data.stats);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders requiring attention
  const fetchAttention = async () => {
    try {
      const response = await ordersAPI.getRequiringAttention();
      if (response.success) {
        setAttention(response.data);
      }
    } catch (error) {
      console.error("Error fetching attention orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAttention();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleExport = async () => {
    try {
      toast.loading("Exporting orders...");
      await ordersAPI.export(filters);
      toast.dismiss();
      toast.success("Orders exported successfully");
    } catch (error) {
      toast.dismiss();
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage and track all platform orders
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <OrderStatsCards stats={stats} attention={attention} />

        {/* Filters */}
        <OrderFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          loading={loading}
        />

        {/* Orders Table */}
        <OrderTable
          orders={orders}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default OrdersListPage;
