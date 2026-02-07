import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  FolderTree,
  Ticket,
  Bike,
  Star,
  CreditCard,
  DollarSign,
  Truck,
  TrendingUp,
  MapPin,
  LogOut,
} from "lucide-react";

const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClass = (path) => {
    const baseClass =
      "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors";
    const activeClass = "bg-green-50 text-green-700 font-medium";
    const inactiveClass = "text-gray-700 hover:bg-gray-100";
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-bold text-green-600">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link
              to="/admin/dashboard"
              className={getLinkClass("/admin/dashboard")}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/users" className={getLinkClass("/admin/users")}>
              <Users className="w-5 h-5" />
              <span>Users</span>
            </Link>
            <Link to="/admin/stores" className={getLinkClass("/admin/stores")}>
              <Store className="w-5 h-5" />
              <span>Stores</span>
            </Link>
            <Link
              to="/admin/products"
              className={getLinkClass("/admin/products")}
            >
              <Package className="w-5 h-5" />
              <span>Products</span>
            </Link>
            <Link to="/admin/orders" className={getLinkClass("/admin/orders")}>
              <ShoppingCart className="w-5 h-5" />
              <span>Orders</span>
            </Link>
            <Link
              to="/admin/categories"
              className={getLinkClass("/admin/categories")}
            >
              <FolderTree className="w-5 h-5" />
              <span>Categories</span>
            </Link>
            <Link
              to="/admin/coupons"
              className={getLinkClass("/admin/coupons")}
            >
              <Ticket className="w-5 h-5" />
              <span>Coupons</span>
            </Link>
            <Link to="/admin/riders" className={getLinkClass("/admin/riders")}>
              <Bike className="w-5 h-5" />
              <span>Riders</span>
            </Link>
            <Link
              to="/admin/tracking"
              target="_blank"
              rel="noopener noreferrer"
              className={getLinkClass("/admin/tracking")}
            >
              <MapPin className="w-5 h-5" />
              <span>Live Tracking</span>
            </Link>
            <Link
              to="/admin/reviews"
              className={getLinkClass("/admin/reviews")}
            >
              <Star className="w-5 h-5" />
              <span>Reviews</span>
            </Link>
            <Link
              to="/admin/payments"
              className={getLinkClass("/admin/payments")}
            >
              <CreditCard className="w-5 h-5" />
              <span>Payments</span>
            </Link>
            <Link
              to="/admin/refunds"
              className={getLinkClass("/admin/refunds")}
            >
              <DollarSign className="w-5 h-5" />
              <span>Refunds</span>
            </Link>
            <Link
              to="/admin/delivery-settings"
              className={getLinkClass("/admin/delivery-settings")}
            >
              <Truck className="w-5 h-5" />
              <span>Delivery Settings</span>
            </Link>
            <Link
              to="/admin/analytics"
              className={getLinkClass("/admin/analytics")}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
