import { ShoppingCart, Clock, CheckCircle, XCircle } from "lucide-react";

const OrdersStats = ({ stats }) => {
  const cards = [
    {
      title: "Total Orders",
      value: stats?.total || 0,
      icon: ShoppingCart,
      bgColor: "bg-blue-500",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      icon: Clock,
      bgColor: "bg-yellow-500",
    },
    {
      title: "Completed",
      value: stats?.delivered || 0,
      icon: CheckCircle,
      bgColor: "bg-green-500",
    },
    {
      title: "Cancelled",
      value: stats?.cancelled || 0,
      icon: XCircle,
      bgColor: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrdersStats;
