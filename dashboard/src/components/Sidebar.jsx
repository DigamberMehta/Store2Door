import { useState } from "react";
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
  ChevronDown,
  Store,
  MapPin,
  Sparkles,
  CreditCard,
  Clock,
  Truck,
} from "lucide-react";

const Sidebar = ({ user, onLogout, type = "store" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({
    products: true,
    settings: true,
  });

  const storeNavItems = [
    { path: "/store/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    {
      label: "Products",
      icon: Package,
      key: "products",
      submenu: [
        { path: "/store/products", icon: Package, label: "View Products" },
        {
          path: "/store/products/add",
          icon: PackagePlus,
          label: "Add Product",
        },
      ],
    },
    { path: "/store/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/store/finance", icon: DollarSign, label: "Finance" },
    { path: "/store/reviews", icon: Star, label: "Reviews" },
    {
      label: "Settings",
      icon: Settings,
      key: "settings",
      submenu: [
        {
          path: "/store/settings/profile",
          icon: Store,
          label: "Store Profile",
        },
        {
          path: "/store/settings/location",
          icon: MapPin,
          label: "Location & Contact",
        },
        {
          path: "/store/settings/features",
          icon: Sparkles,
          label: "Store Features",
        },
        {
          path: "/store/settings/bank",
          icon: CreditCard,
          label: "Bank Account",
        },
        {
          path: "/store/settings/hours",
          icon: Clock,
          label: "Operating Hours",
        },
      ],
    },
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

            // Handle submenu items
            if (item.submenu) {
              const isOpen = openMenus[item.key];
              const hasActiveChild = item.submenu.some((sub) =>
                isActive(sub.path),
              );

              return (
                <div key={item.key}>
                  <button
                    onClick={() =>
                      setOpenMenus((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`
                      w-full group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                      ${
                        hasActiveChild
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${hasActiveChild ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="mt-1 ml-4 space-y-1">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = isActive(subItem.path);

                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`
                              group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                              ${
                                subActive
                                  ? "bg-green-50 text-green-600"
                                  : "text-gray-600 hover:bg-gray-50"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2.5">
                              <SubIcon
                                className={`w-4 h-4 ${subActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}
                              />
                              <span>{subItem.label}</span>
                            </div>
                            {subActive && (
                              <ChevronRight className="w-3 h-3 text-green-600" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular menu item
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${active ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4 text-green-600" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-xs font-semibold shadow-lg">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
