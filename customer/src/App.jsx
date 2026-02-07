import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/homepage/HomePage";
import StoreDetailPage from "./pages/store/StoreDetailPage";
import FilterPage from "./pages/search/FilterPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SearchPage from "./pages/search/SearchPage";
import ProductDetailPage from "./pages/product/ProductDetailPage";
import AllReviewsPage from "./pages/product/AllReviewsPage";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProfileDetailsPage from "./pages/profile/ProfileDetailsPage";
import AddressPage from "./pages/profile/AddressPage";
import OrdersPage from "./pages/profile/OrdersPage";
import OrderDetailPage from "./pages/profile/OrderDetailPage";
import RefundsPage from "./pages/profile/RefundsPage";
import WalletPage from "./pages/profile/WalletPage";
import OrderTrackingPage from "./pages/orders/OrderTrackingPage";
import OrderDeliveredPage from "./pages/orders/OrderDeliveredPage";
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailurePage from "./pages/payment/PaymentFailurePage";
import PaymentVerifyPage from "./pages/payment/PaymentVerifyPage";
import {
  AboutUsPage,
  TermsOfServicePage,
  PrivacyPolicyPage,
  HelpSupportPage,
  ContactUsPage,
} from "./pages/info";
import FloatingCartButton from "./components/FloatingCartButton";

// Wrapper component to provide navigation handlers
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleStoreClick = (store) => {
    const storeNameSlug = store.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/store/${storeNameSlug}`, { state: { store } });
  };

  const handleCategoryClick = (category) => {
    // Use the slug for the URL if available, otherwise create from category name
    const slug =
      category.slug || category.category.toLowerCase().replace(/\s+/g, "-");
    navigate(`/category/${slug}`, {
      state: { category },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onStoreClick={handleStoreClick}
              onCategoryClick={handleCategoryClick}
            />
          }
        />
        <Route
          path="/home"
          element={
            <HomePage
              onStoreClick={handleStoreClick}
              onCategoryClick={handleCategoryClick}
            />
          }
        />
        <Route path="/store/:storeName" element={<StoreDetailPage />} />
        <Route
          path="/category/:categoryName"
          element={<FilterPage onStoreClick={handleStoreClick} />}
        />
        <Route
          path="/grocery"
          element={<FilterPage onStoreClick={handleStoreClick} />}
        />
        <Route
          path="/snacks"
          element={<FilterPage onStoreClick={handleStoreClick} />}
        />
        <Route
          path="/beauty"
          element={<FilterPage onStoreClick={handleStoreClick} />}
        />
        <Route
          path="/home-lifestyle"
          element={<FilterPage onStoreClick={handleStoreClick} />}
        />
        <Route
          path="/stores"
          element={<FilterPage onStoreClick={handleStoreClick} />}
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failure" element={<PaymentFailurePage />} />
        <Route path="/payment/verify" element={<PaymentVerifyPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/details"
          element={
            <ProtectedRoute>
              <ProfileDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/addresses"
          element={
            <ProtectedRoute>
              <AddressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/refunds"
          element={
            <ProtectedRoute>
              <RefundsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId/track"
          element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:orderId/track"
          element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId/delivered"
          element={
            <ProtectedRoute>
              <OrderDeliveredPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:orderId/delivered"
          element={
            <ProtectedRoute>
              <OrderDeliveredPage />
            </ProtectedRoute>
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:id/:slug" element={<ProductDetailPage />} />
        <Route path="/product/reviews" element={<AllReviewsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Info Pages */}
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/help" element={<HelpSupportPage />} />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <ContactUsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route - redirect to home */}
        <Route
          path="*"
          element={
            <HomePage
              onStoreClick={handleStoreClick}
              onCategoryClick={handleCategoryClick}
            />
          }
        />
      </Routes>

      {/* Toast Notifications */}
      <Toaster />

      {/* Floating Cart Button - Hidden on payment, checkout, and profile pages */}
      {!["/payment", "/checkout", "/profile"].some((path) =>
        location.pathname.startsWith(path),
      ) && <FloatingCartButton />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <AppContent />
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
