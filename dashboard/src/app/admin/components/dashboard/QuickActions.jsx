import {
  Store,
  Users,
  ShoppingBag,
  Settings,
  FileText,
  Bell,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

const QuickActions = () => {
  const actions = [
    {
      icon: Store,
      label: "Manage Stores",
      description: "Review & approve stores",
      link: "/admin/stores",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      icon: Users,
      label: "User Management",
      description: "View all users",
      link: "/admin/users",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
    },
    {
      icon: ShoppingBag,
      label: "Orders",
      description: "Monitor all orders",
      link: "/admin/orders",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      icon: TrendingUp,
      label: "Analytics",
      description: "Platform insights",
      link: "/admin/analytics",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
    {
      icon: FileText,
      label: "Reports",
      description: "Generate reports",
      link: "/admin/reports",
      color: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Send announcements",
      link: "/admin/notifications",
      color: "bg-pink-500",
      hoverColor: "hover:bg-pink-600",
    },
    {
      icon: Shield,
      label: "Compliance",
      description: "Review compliance",
      link: "/admin/compliance",
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600",
    },
    {
      icon: Settings,
      label: "Platform Settings",
      description: "Configure system",
      link: "/admin/settings",
      color: "bg-gray-700",
      hoverColor: "hover:bg-gray-800",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Frequently used admin functions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`group ${action.color} ${action.hoverColor} text-white rounded-lg p-3 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <action.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight mb-0.5">
                  {action.label}
                </p>
                <p className="text-xs opacity-90 leading-tight">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
