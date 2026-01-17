import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import HomePage from "./pages/homepage/HomePage";
import StoreDetailPage from "./pages/store/StoreDetailPage";
import StoreSearchPage from "./pages/store/StoreSearchPage";
import FilterPage from "./pages/search/FilterPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import SettingsPage from "./pages/settings/SettingsPage";
import SearchPage from "./pages/search/SearchPage";
import ProductDetailPage from "./pages/product/ProductDetailPage";

// Wrapper component to provide navigation handlers
function AppContent() {
  const navigate = useNavigate();

  const handleStoreClick = (store) => {
    const storeNameSlug = store.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/store/${storeNameSlug}`, { state: { store } });
  };

  const handleCategoryClick = (category) => {
    navigate(
      `/category/${category.category.toLowerCase().replace(/\s+/g, "-")}`,
      {
        state: { category },
      }
    );
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
        <Route path="/store/:storeName/search" element={<StoreSearchPage />} />
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
        <Route path="/setting" element={<SettingsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:productName/info" element={<ProductDetailPage />} />
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
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
