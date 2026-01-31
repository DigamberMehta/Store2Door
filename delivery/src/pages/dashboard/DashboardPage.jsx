import { useState, useEffect } from "react";
import HeroSection from "../../components/home/HeroSection";
import StatusToggle from "../../components/home/StatusToggle";
import ActiveOrderCard from "../../components/home/ActiveOrderCard";
import EarningCard from "../../components/home/EarningCard";
import NotificationCard from "../../components/home/NotificationCard";
import RecentTransactions from "../../components/home/RecentTransactions";
import BottomNavigation from "../../components/home/BottomNavigation";
import { ordersAPI } from "../../services/api";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    earnings: null,
    activeOrder: null,
    transactions: [],
    loading: true,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [earningsRes, ordersRes, transactionsRes] = await Promise.all([
        ordersAPI.getEarnings(),
        ordersAPI.getMyOrders(),
        ordersAPI.getTransactions(3),
      ]);

      // Find active order
      const activeOrder = ordersRes.data?.orders?.find(
        (o) => o.status === "assigned" || o.status === "on_the_way",
      );

      setDashboardData({
        earnings: earningsRes.data || {},
        activeOrder: activeOrder || null,
        transactions: transactionsRes.data || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <HeroSection />
      <StatusToggle />
      <ActiveOrderCard
        activeOrder={dashboardData.activeOrder}
        loading={dashboardData.loading}
      />
      <EarningCard
        earnings={dashboardData.earnings}
        loading={dashboardData.loading}
      />
      <NotificationCard />
      <RecentTransactions
        transactions={dashboardData.transactions}
        loading={dashboardData.loading}
      />
      <BottomNavigation />
    </div>
  );
};

export default DashboardPage;
