import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DeliveriesPage from "./pages/delivery/DeliveriesPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import WalletPage from "./pages/earnings/WalletPage";
import WithdrawalsPage from "./pages/earnings/WithdrawalsPage";
import ActivitiesPage from "./pages/earnings/ActivitiesPage";
import ProfilePage from "./pages/profile/ProfilePage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/deliveries" element={<DeliveriesPage />} />
        <Route path="/order-detail" element={<OrderDetailPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/withdrawals" element={<WithdrawalsPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
