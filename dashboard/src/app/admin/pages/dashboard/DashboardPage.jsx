import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { dashboardAPI } from "../../../../services/admin/api";
import StatsCards from "../../components/dashboard/StatsCards";
import RecentOrders from "../../components/dashboard/RecentOrders";
import TopStores from "../../components/dashboard/TopStores";
import PlatformEarnings from "../../components/dashboard/PlatformEarnings";
import ActivityChart from "../../components/dashboard/ActivityChart";
import RecentReviews from "../../components/dashboard/RecentReviews";
import QuickActions from "../../components/dashboard/QuickActions";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeStores: 0,
    totalUsers: 0,
    revenueTrend: 0,
    ordersTrend: 0,
    storesTrend: 0,
    usersTrend: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [activityData, setActivityData] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [
        statsRes,
        ordersRes,
        storesRes,
        earningsRes,
        activityRes,
        reviewsRes,
      ] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentOrders(3),
        dashboardAPI.getTopStores(3),
        dashboardAPI.getEarnings(),
        dashboardAPI.getActivityData(7),
        dashboardAPI.getRecentReviews(3),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (ordersRes.success) {
        setRecentOrders(ordersRes.data);
      }

      if (storesRes.success) {
        setTopStores(storesRes.data);
      }

      if (earningsRes.success) {
        setEarnings(earningsRes.data);
      }

      if (activityRes.success) {
        setActivityData(activityRes.data);
      }

      if (reviewsRes.success) {
        setRecentReviews(reviewsRes.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityChart data={activityData} type="area" />
            <RecentOrders orders={recentOrders} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <PlatformEarnings earnings={earnings} />
            <TopStores stores={topStores} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentReviews reviews={recentReviews} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
