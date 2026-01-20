import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DeliveriesPage from "./pages/delivery/DeliveriesPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import WalletPage from "./pages/earnings/WalletPage";
import WithdrawalsPage from "./pages/earnings/WithdrawalsPage";
import ActivitiesPage from "./pages/earnings/ActivitiesPage";
import ProfilePage from "./pages/profile/ProfilePage";
import DocumentsPage from "./pages/profile/DocumentsPage";
import PreferredAreasPage from "./pages/profile/PreferredAreasPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/deliveries" element={<ProtectedRoute><DeliveriesPage /></ProtectedRoute>} />
        <Route path="/order-detail" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/withdrawals" element={<ProtectedRoute><WithdrawalsPage /></ProtectedRoute>} />
        <Route path="/activities" element={<ProtectedRoute><ActivitiesPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
        <Route path="/profile/areas" element={<ProtectedRoute><PreferredAreasPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
