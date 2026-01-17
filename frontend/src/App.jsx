import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import HomePage from "./pages/homepage/HomePage";
import StoreDetailPage from "./pages/StoreDetailPage";
import FilterPage from "./pages/FilterPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import SettingsPage from "./pages/settings/SettingsPage";

// Wrapper component to provide navigation handlers
function AppContent() {
  const navigate = useNavigate();

  const handleStoreClick = (store) => {
    navigate(`/store/${store.id}`, { state: { store } });
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
        <Route path="/store/:id" element={<StoreDetailPage />} />
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
