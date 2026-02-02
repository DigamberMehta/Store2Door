import { DollarSign, Calendar } from "lucide-react";

const PlatformEarnings = ({ earnings = {} }) => {
  const {
    totalRevenue = 0,
    platformFee = 0,
    deliveryFees = 0,
    totalOrders = 0,
    averageOrderValue = 0,
  } = earnings;

  const formatCurrency = (amount) => {
    return `R${amount.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Platform Earnings</h2>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>This Month</span>
        </div>
      </div>

      {/* Total Revenue Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 mb-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm font-medium text-blue-100 mb-1">Total Revenue</p>
        <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        <p className="text-xs text-blue-100 mt-2">
          From {totalOrders.toLocaleString()} orders
        </p>
      </div>

      {/* Earnings Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Platform Fees</p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(platformFee)}
            </p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Delivery Fees</p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(deliveryFees)}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Avg Order Value</p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(averageOrderValue)}
            </p>
          </div>
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Net Earnings</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(platformFee + deliveryFees)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformEarnings;
