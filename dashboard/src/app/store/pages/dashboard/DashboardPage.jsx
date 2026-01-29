import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import StatsCards from "../../components/dashboard/StatsCards";
import RecentOrders from "../../components/dashboard/RecentOrders";
import TopProducts from "../../components/dashboard/TopProducts";
import EarningsOverview from "../../components/dashboard/EarningsOverview";
import SalesChart from "../../components/dashboard/SalesChart";
import RecentReviews from "../../components/dashboard/RecentReviews";
import QuickActions from "../../components/dashboard/QuickActions";
import { getDashboardStats } from "../../../../services/store/api/dashboardApi";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      todaySales: 0,
      todaySalesChange: 0,
      totalOrders: 0,
      ordersChange: 0,
      productsSold: 0,
      productsSoldChange: 0,
      revenue: 0,
      revenueChange: 0,
    },
    recentOrders: [],
    topProducts: [],
    earnings: {
      total: 0,
      pending: 0,
      paid: 0,
      nextPayout: "",
    },
    salesData: [],
    recentReviews: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats();

      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Refresh Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6">
        <StatsCards stats={dashboardData.stats} />
      </div>

      {/* Main Grid */}
      <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <SalesChart data={dashboardData.salesData} />
          <RecentOrders orders={dashboardData.recentOrders} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-4">
          <EarningsOverview earnings={dashboardData.earnings} />
          <QuickActions />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <TopProducts products={dashboardData.topProducts} />
        <RecentReviews reviews={dashboardData.recentReviews} />
      </div>
    </div>
  );
};

export default DashboardPage;
