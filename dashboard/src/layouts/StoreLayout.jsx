import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useStoreAuth } from "../context/StoreAuthContext";
import { storeAPI } from "../services/store/api";
import Sidebar from "../components/Sidebar";

const StoreLayout = () => {
  const { user, logout } = useStoreAuth();
  const [storeName, setStoreName] = useState("Store2Door");

  useEffect(() => {
    const fetchStoreProfile = async () => {
      try {
        const response = await storeAPI.getMyProfile();
        if (response.success && response.data?.name) {
          setStoreName(response.data.name);
        }
      } catch (error) {
        console.error("Failed to fetch store profile:", error);
      }
    };

    fetchStoreProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        onLogout={logout}
        type="store"
        storeName={storeName}
      />

      {/* Main Content */}
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default StoreLayout;
