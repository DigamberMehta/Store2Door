import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/homepage/HomePage";
import StoreDetailPage from "./pages/store/StoreDetailPage";
import FilterPage from "./pages/search/FilterPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SearchPage from "./pages/search/SearchPage";
import ProductDetailPage from "./pages/product/ProductDetailPage";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ProfileDetailsPage from "./pages/profile/ProfileDetailsPage";
import AddressPage from "./pages/profile/AddressPage";
import OrdersPage from "./pages/profile/OrdersPage";
import OrderDetailPage from "./pages/profile/OrderDetailPage";
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailurePage from "./pages/payment/PaymentFailurePage";
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
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failure" element={<PaymentFailurePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/details" element={<ProfileDetailsPage />} />
        <Route path="/profile/addresses" element={<AddressPage />} />
        <Route path="/profile/orders" element={<OrdersPage />} />
        <Route path="/profile/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:id/:slug" element={<ProductDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
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
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
