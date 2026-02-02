import { ShoppingBag, TrendingUp, DollarSign, Calendar } from "lucide-react";

const UserStatsCard = ({ stats, role }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatsForRole = () => {
    if (role === "customer") {
      return [
        {
          label: "Total Orders",
          value: stats.totalOrders || 0,
          icon: ShoppingBag,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          label: "Completed Orders",
          value: stats.completedOrders || 0,
          icon: TrendingUp,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          label: "Total Spent",
          value: formatCurrency(stats.totalSpent),
          icon: DollarSign,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          label: "Last Order",
          value: formatDate(stats.lastOrderDate),
          icon: Calendar,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
      ];
    } else if (role === "delivery_rider") {
      return [
        {
          label: "Total Deliveries",
          value: stats.totalOrders || 0,
          icon: ShoppingBag,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          label: "Completed Deliveries",
          value: stats.completedOrders || 0,
          icon: TrendingUp,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          label: "Total Earnings",
          value: formatCurrency(stats.totalSpent),
          icon: DollarSign,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          label: "Last Delivery",
          value: formatDate(stats.lastOrderDate),
          icon: Calendar,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
      ];
    } else if (role === "store_manager") {
      return [
        {
          label: "Total Orders",
          value: stats.totalOrders || 0,
          icon: ShoppingBag,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          label: "Revenue",
          value: formatCurrency(stats.totalSpent),
          icon: DollarSign,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ];
    }

    return [];
  };

  const statsData = getStatsForRole();

  if (statsData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-base font-semibold text-gray-900 mb-3">Statistics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserStatsCard;
