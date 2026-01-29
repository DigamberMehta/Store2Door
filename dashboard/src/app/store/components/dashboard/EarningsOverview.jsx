import { DollarSign, Clock, CircleCheck } from "lucide-react";

const EarningsOverview = ({ earnings }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Earnings Overview
      </h2>

      <div className="space-y-4">
        <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4" />
            <p className="text-xs font-medium opacity-90">Total Earnings</p>
          </div>
          <p className="text-2xl font-bold">
            R{earnings.total.toLocaleString()}
          </p>
          <p className="text-xs opacity-80 mt-1">This month</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-xs font-medium text-yellow-800">Pending</p>
            </div>
            <p className="text-xl font-bold text-yellow-900">
              R{earnings.pending.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CircleCheck className="w-4 h-4 text-green-600" />
              <p className="text-xs font-medium text-green-800">Paid Out</p>
            </div>
            <p className="text-xl font-bold text-green-900">
              R{earnings.paid.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Next Payout</span>
            <span className="font-semibold text-gray-900">
              {earnings.nextPayout}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsOverview;
