import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

// Layouts
import StoreLayout from "../layouts/StoreLayout";
import AdminLayout from "../layouts/AdminLayout";

// Protected Routes
import {
  StoreProtectedRoute,
  AdminProtectedRoute,
} from "../components/ProtectedRoute";

// Store Manager Pages
import StoreDashboard from "../app/store/pages/dashboard/DashboardPage";
import StoreAnalytics from "../app/store/pages/dashboard/StoreAnalyticsPage";

import ProductList from "../app/store/pages/products/ProductsPage";
import AddProduct from "../app/store/pages/products/CreateProductPage";
import EditProduct from "../app/store/pages/products/EditProductPage";
import ProductInventory from "../app/store/pages/products/InventoryPage";

import OrderList from "../app/store/pages/orders/OrdersPage";
import OrderDetails from "../app/store/pages/orders/OrderDetailsPage";

import FinancePage from "../app/store/pages/finance/FinancePage";
import EarningsOverview from "../app/store/pages/finance/EarningsPage";
import PaymentHistory from "../app/store/pages/finance/TransactionsPage";
import Payouts from "../app/store/pages/finance/PayoutHistoryPage";

import ReviewList from "../app/store/pages/reviews/ReviewsPage";

import StoreProfile from "../app/store/pages/settings/ProfilePage";
import LocationContact from "../app/store/pages/settings/LocationContactPage";
import StoreFeatures from "../app/store/pages/settings/StoreFeaturesPage";
import BankAccountSettings from "../app/store/pages/settings/BankAccountPage";
import OperatingHoursSettings from "../app/store/pages/settings/OperatingHoursPage";
import DeliverySettings from "../app/store/pages/settings/DeliverySettingsPage";

// Admin Pages
import AdminDashboard from "../app/admin/pages/dashboard/DashboardPage";
import UsersPage from "../app/admin/pages/users/UsersPage";
import UserDetailPage from "../app/admin/pages/users/detail/UserDetailPage";
import UserOrdersPage from "../app/admin/pages/users/UserOrdersPage";

// Admin Pages (placeholders - will be created later)
const AdminStores = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Stores Management</h1>
  </div>
);
const AdminProducts = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Products Management</h1>
  </div>
);
const AdminOrders = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Orders Management</h1>
  </div>
);
const AdminCategories = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Categories Management</h1>
  </div>
);
const AdminCoupons = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Coupons Management</h1>
  </div>
);
const AdminRiders = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Riders Management</h1>
  </div>
);
const AdminReviews = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Reviews Management</h1>
  </div>
);
const AdminPayments = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Payments Management</h1>
  </div>
);
const AdminDeliverySettings = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Delivery Settings</h1>
  </div>
);
const AdminAnalytics = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Analytics</h1>
  </div>
);

export const router = createBrowserRouter([
  // Auth Routes
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },

  // Store Manager Routes
  {
    path: "/store",
    element: (
      <StoreProtectedRoute>
        <StoreLayout />
      </StoreProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <StoreDashboard />,
      },
      {
        path: "analytics",
        element: <StoreAnalytics />,
      },
      {
        path: "products",
        element: <ProductList />,
      },
      {
        path: "products/add",
        element: <AddProduct />,
      },
      {
        path: "products/edit/:id",
        element: <EditProduct />,
      },
      {
        path: "products/inventory",
        element: <ProductInventory />,
      },
      {
        path: "orders",
        element: <OrderList />,
      },
      {
        path: "orders/:id",
        element: <OrderDetails />,
      },
      {
        path: "finance",
        element: <FinancePage />,
      },
      {
        path: "finance/earnings",
        element: <EarningsOverview />,
      },
      {
        path: "finance/history",
        element: <PaymentHistory />,
      },
      {
        path: "finance/payouts",
        element: <Payouts />,
      },
      {
        path: "reviews",
        element: <ReviewList />,
      },
      {
        path: "settings/profile",
        element: <StoreProfile />,
      },
      {
        path: "settings/location",
        element: <LocationContact />,
      },
      {
        path: "settings/features",
        element: <StoreFeatures />,
      },
      {
        path: "settings/bank",
        element: <BankAccountSettings />,
      },
      {
        path: "settings/hours",
        element: <OperatingHoursSettings />,
      },
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "users/:id",
        element: <UserDetailPage />,
      },
      {
        path: "users/:id/orders",
        element: <UserOrdersPage />,
      },
      {
        path: "stores",
        element: <AdminStores />,
      },
      {
        path: "products",
        element: <AdminProducts />,
      },
      {
        path: "orders",
        element: <AdminOrders />,
      },
      {
        path: "categories",
        element: <AdminCategories />,
      },
      {
        path: "coupons",
        element: <AdminCoupons />,
      },
      {
        path: "riders",
        element: <AdminRiders />,
      },
      {
        path: "reviews",
        element: <AdminReviews />,
      },
      {
        path: "payments",
        element: <AdminPayments />,
      },
      {
        path: "delivery-settings",
        element: <AdminDeliverySettings />,
      },
      {
        path: "analytics",
        element: <AdminAnalytics />,
      },
    ],
  },

  // Redirect root to login
  {
    path: "/",
    element: <LoginPage />,
  },
]);
