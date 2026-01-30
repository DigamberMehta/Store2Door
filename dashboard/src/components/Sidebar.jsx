import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingCart,
  DollarSign,
  Star,
  Settings,
  LogOut,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ user, onLogout, type = "store" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const storeNavItems = [
    { path: "/store/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/store/products", icon: Package, label: "View Product" },
    { path: "/store/products/add", icon: PackagePlus, label: "Add Product" },
    { path: "/store/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/store/finance", icon: DollarSign, label: "Finance" },
    { path: "/store/reviews", icon: Star, label: "Reviews" },
    { path: "/store/settings", icon: Settings, label: "Settings" },
  ];

  const navItems = type === "store" ? storeNavItems : [];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Door2Door</h1>
            <p className="text-xs text-gray-500">
              {type === "store" ? "Store Manager" : "Admin Panel"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${active ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  <span>{item.label}</span>
                </div>
                {active && (
                  <ChevronRight className="w-4 h-4 text-green-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
