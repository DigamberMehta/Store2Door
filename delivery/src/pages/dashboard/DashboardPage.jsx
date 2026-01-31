import HeroSection from "../../components/home/HeroSection";
import StatusToggle from "../../components/home/StatusToggle";
import ActiveOrderCard from "../../components/home/ActiveOrderCard";
import EarningCard from "../../components/home/EarningCard";
import NotificationCard from "../../components/home/NotificationCard";
import RecentTransactions from "../../components/home/RecentTransactions";
import BottomNavigation from "../../components/home/BottomNavigation";

const DashboardPage = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      <HeroSection />
      <StatusToggle />
      <ActiveOrderCard />
      <EarningCard />
      <NotificationCard />
      <RecentTransactions />
      <BottomNavigation />
    </div>
  );
};

export default DashboardPage;
