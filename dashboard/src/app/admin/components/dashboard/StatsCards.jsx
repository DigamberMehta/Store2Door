import { DollarSign, ShoppingCart, Store, Users } from "lucide-react";

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Revenue",
      value: `R${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "blue",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders?.toLocaleString() || 0,
      icon: ShoppingCart,
      color: "green",
    },
    {
      title: "Active Stores",
      value: stats.activeStores?.toLocaleString() || 0,
      icon: Store,
      color: "purple",
    },
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString() || 0,
      icon: Users,
      color: "orange",
    },
  ];

  const getBackgroundColor = (color) => {
    const colors = {
      blue: "bg-blue-50",
      green: "bg-green-50",
      purple: "bg-purple-50",
      orange: "bg-orange-50",
    };
    return colors[color] || "bg-gray-50";
  };

  const getIconColor = (color) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600",
    };
    return colors[color] || "text-gray-600";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {card.value}
              </p>
            </div>
            <div
              className={`w-10 h-10 ${getBackgroundColor(card.color)} rounded-lg flex items-center justify-center`}
            >
              <card.icon className={`w-5 h-5 ${getIconColor(card.color)}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
