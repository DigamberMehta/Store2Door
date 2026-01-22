import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DeliveriesPage from "./pages/delivery/DeliveriesPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import WalletPage from "./pages/earnings/WalletPage";
import WithdrawalsPage from "./pages/earnings/WithdrawalsPage";
import ActivitiesPage from "./pages/earnings/ActivitiesPage";
import ProfilePage from "./pages/profile/ProfilePage";
import DocumentsPage from "./pages/profile/document/DocumentsPage";
import PreferredAreasPage from "./pages/profile/work/PreferredAreasPage";
import PersonalDetailsPage from "./pages/profile/personal/PersonalDetailsPage";
import BankAccountPage from "./pages/profile/bank/BankAccountPage";
import VehicleDetailsPage from "./pages/profile/vehicle/VehicleDetailsPage";
import EmergencyContactPage from "./pages/profile/emergency/EmergencyContactPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/deliveries"
          element={
            <ProtectedRoute>
              <DeliveriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-detail"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdrawals"
          element={
            <ProtectedRoute>
              <WithdrawalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute>
              <ActivitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/documents"
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/areas"
          element={
            <ProtectedRoute>
              <PreferredAreasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/personal-details"
          element={
            <ProtectedRoute>
              <PersonalDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/bank-account"
          element={
            <ProtectedRoute>
              <BankAccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/vehicle-details"
          element={
            <ProtectedRoute>
              <VehicleDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/emergency-contact"
          element={
            <ProtectedRoute>
              <EmergencyContactPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
