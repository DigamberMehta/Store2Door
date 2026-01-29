import { Outlet } from "react-router-dom";
import { useStoreAuth } from "../context/StoreAuthContext";
import Sidebar from "../components/Sidebar";

const StoreLayout = () => {
  const { user, logout } = useStoreAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={logout} type="store" />

      {/* Main Content */}
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default StoreLayout;
