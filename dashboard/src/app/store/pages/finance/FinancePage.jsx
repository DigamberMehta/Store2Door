import { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  CreditCard,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../../../services/store/api/client";

const FinancePage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalOrders: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    averageOrderValue: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    period: "all", // week, month, year, all
    status: "all", // all, succeeded, failed, refunded
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchFinanceData();
  }, [filters]);

  const fetchFinanceData = async () => {
    console.log("🔄 Fetching finance data with filters:", filters);
    try {
      setLoading(true);
      const response = await apiClient.get("/payments", {
        params: filters
      });

      console.log("📦 Full API Response:", response);
      console.log("✅ Success:", response.success);
      console.log("📊 Stats:", response.stats);
      console.log("💰 Transactions:", response.data);
      console.log("📄 Pagination:", response.pagination);

      if (response.success) {
        // Map backend response to frontend state
        const backendStats = response.stats;
        
        // Log payment information
        console.log("=== PAYMENT STATISTICS FOR CURRENT STORE ===");
        console.log("Total Payments:", response.pagination.total);
        console.log("Successful Payments:", backendStats.successfulPayments);
        console.log("Failed Payments:", backendStats.failedPayments);
        console.log("Refunded Payments:", backendStats.refundedPayments);
        console.log("Total Earnings: R", backendStats.totalEarnings);
        console.log("============================================");
        
        setStats({
          totalEarnings: backendStats.totalEarnings || 0,
          pendingEarnings: backendStats.pendingEarnings || 0,
          paidEarnings: backendStats.paidEarnings || 0,
          totalOrders: backendStats.totalOrders || 0,
          successfulPayments: backendStats.successfulPayments || 0,
          failedPayments: backendStats.failedPayments || 0,
          refundedPayments: backendStats.refundedPayments || 0,
          averageOrderValue: backendStats.averageOrderValue || 0
        });
        setTransactions(response.data);
        setPagination(response.pagination);
      } else {
        console.error("❌ Response success is false");
      }
    } catch (error) {
      console.error("❌ Error fetching finance data:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to load finance data");
    } finally {
      setLoading(false);
      console.log("✔️ Loading completed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-700 border-green-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      case "refunded":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case "yoco_card":
        return "Card";
      case "yoco_eft":
        return "EFT";
      case "yoco_instant_eft":
        return "Instant EFT";
      default:
        return method;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount) => {
    return `R${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your earnings and transactions
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <DollarSign className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Total Earnings</p>
            <h3 className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</h3>
          </div>
        </div>

        {/* Pending Earnings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-2">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600">Pending</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Pending Earnings</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingEarnings)}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-lg p-2">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600">Orders</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 rounded-lg p-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600">Avg</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Avg Order Value</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</h3>
          </div>
        </div>
      </div>

      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Successful</p>
              <p className="text-xl font-bold text-gray-900">{stats.successfulPayments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-lg p-3">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Failed</p>
              <p className="text-xl font-bold text-gray-900">{stats.failedPayments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-lg p-3">
              <ArrowDownRight className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Refunded</p>
              <p className="text-xl font-bold text-gray-900">{stats.refundedPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.period}
            onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value, page: 1 }))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Status</option>
            <option value="succeeded">Successful</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-900">{transaction.paymentNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.orderId?.orderNumber || "N/A"}</p>
                        <p className="text-xs text-gray-500">{transaction.orderId?.items?.length || 0} items</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{transaction.userId?.name || "Unknown"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{getPaymentMethodDisplay(transaction.method)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {filters.page} of {pagination.pages}</span>
              <button
                disabled={filters.page === pagination.pages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancePage;
