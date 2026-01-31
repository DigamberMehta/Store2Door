import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: "Today's Sales",
      value: `R${stats.todaySales.toLocaleString()}`,
      change: stats.todaySalesChange,
      icon: DollarSign,
      bgColor: "bg-green-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      change: stats.ordersChange,
      icon: ShoppingCart,
      bgColor: "bg-blue-500",
    },
    {
      title: "Products Sold",
      value: stats.productsSold,
      change: stats.productsSoldChange,
      icon: Package,
      bgColor: "bg-purple-500",
    },
    {
      title: "Revenue",
      value: `R${stats.revenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: TrendingUp,
      bgColor: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;

        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {isPositive ? "+" : ""}
                {card.change}%
              </span>
            </div>
            <h3 className="text-gray-600 text-xs font-medium mb-1">
              {card.title}
            </h3>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
