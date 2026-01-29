import { Plus, Package, Store, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Plus,
      label: "Add Product",
      description: "Create new product",
      color: "bg-green-500",
      path: "/store/products/add",
    },
    {
      icon: Package,
      label: "View Orders",
      description: "Manage orders",
      color: "bg-blue-500",
      path: "/store/orders",
    },
    {
      icon: Store,
      label: "Store Settings",
      description: "Update store info",
      color: "bg-purple-500",
      path: "/store/settings",
    },
    {
      icon: Settings,
      label: "Preferences",
      description: "Account settings",
      color: "bg-orange-500",
      path: "/store/settings",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <div
                className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                {action.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
