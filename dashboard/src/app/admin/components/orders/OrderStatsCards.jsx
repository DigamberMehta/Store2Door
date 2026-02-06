import React from "react";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  AlertCircle,
} from "lucide-react";

const OrderStatsCards = ({ stats, attention }) => {
  const statsCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Revenue",
      value: `R ${(stats?.totalRevenue || 0).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Average Order Value",
      value: `R ${(stats?.averageOrderValue || 0).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Tips",
      value: `R ${(stats?.totalTips || 0).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: Package,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attention Alert */}
      {attention && attention.totalRequiringAttention > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                {attention.totalRequiringAttention} Orders Requiring Attention
              </h3>
              <div className="text-sm text-yellow-800 space-y-1">
                {attention.stuckPending?.length > 0 && (
                  <p>
                    • {attention.stuckPending.length} pending orders waiting for
                    payment
                  </p>
                )}
                {attention.stuckConfirmed?.length > 0 && (
                  <p>
                    • {attention.stuckConfirmed.length} confirmed orders not
                    being prepared
                  </p>
                )}
                {attention.needsRider?.length > 0 && (
                  <p>
                    • {attention.needsRider.length} orders ready but no rider
                    assigned
                  </p>
                )}
                {attention.failedPayments?.length > 0 && (
                  <p>
                    • {attention.failedPayments.length} orders with failed
                    payments
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatsCards;
