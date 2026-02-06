import React from "react";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Wallet,
  AlertTriangle,
} from "lucide-react";

const RefundStatsCards = ({ stats, walletStats }) => {
  const statsCards = [
    {
      title: "Pending Refunds",
      value: stats?.pending || 0,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved",
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected",
      value: stats?.rejected || 0,
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Amount Refunded",
      value: `R ${(stats?.totalApprovedAmount || 0).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  const walletCards = [
    {
      title: "Total Wallet Balance",
      value: `R ${((walletStats?.totalBalance || 0) / 100).toLocaleString(
        "en-ZA",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}`,
      icon: Wallet,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Flagged Wallets",
      value: walletStats?.flaggedWallets || 0,
      icon: AlertTriangle,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Refund Stats */}
      <div>
        <h2 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
          Refund Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-0.5">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wallet Stats */}
      {walletStats && (
        <div>
          <h2 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            Wallet Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {walletCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600 mb-0.5">
                        {stat.title}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-2 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${stat.textColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundStatsCards;
