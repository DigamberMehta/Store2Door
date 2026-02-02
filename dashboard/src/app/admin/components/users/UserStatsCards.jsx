import { Users, UserCheck, UserX, Mail, Phone, Shield } from "lucide-react";

const UserStatsCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString() || 0,
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Users",
      value: stats.activeUsers?.toLocaleString() || 0,
      icon: UserCheck,
      color: "green",
    },
    {
      title: "Inactive Users",
      value: stats.inactiveUsers?.toLocaleString() || 0,
      icon: UserX,
      color: "red",
    },
    {
      title: "Email Verified",
      value: stats.verification?.emailVerified?.toLocaleString() || 0,
      icon: Mail,
      color: "purple",
    },
  ];

  const getBackgroundColor = (color) => {
    const colors = {
      blue: "bg-blue-50",
      green: "bg-green-50",
      red: "bg-red-50",
      purple: "bg-purple-50",
    };
    return colors[color] || "bg-gray-50";
  };

  const getIconColor = (color) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      red: "text-red-600",
      purple: "text-purple-600",
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

export default UserStatsCards;
