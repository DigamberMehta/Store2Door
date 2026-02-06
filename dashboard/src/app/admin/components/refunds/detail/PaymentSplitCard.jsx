import React from "react";
import { DollarSign } from "lucide-react";

const PaymentSplitCard = ({ paymentSplit }) => {
  if (!paymentSplit) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
        Payment Split Breakdown
      </h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <span className="text-gray-600 text-xs">Store Amount:</span>
          <p className="font-bold text-blue-600 text-lg mt-1">
            R {(paymentSplit.storeAmount || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <span className="text-gray-600 text-xs">Driver Amount:</span>
          <p className="font-bold text-orange-600 text-lg mt-1">
            R {(paymentSplit.driverAmount || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <span className="text-gray-600 text-xs">Platform Amount:</span>
          <p className="font-bold text-purple-600 text-lg mt-1">
            R {(paymentSplit.platformAmount || 0).toFixed(2)}
          </p>
        </div>
      </div>
      {paymentSplit.platformBreakdown && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Platform Markup:</span>
            <span>
              R {(paymentSplit.platformBreakdown.totalMarkup || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Discount Absorbed:</span>
            <span>
              R{" "}
              {(paymentSplit.platformBreakdown.discountAbsorbed || 0).toFixed(
                2,
              )}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Net Earnings:</span>
            <span>
              R {(paymentSplit.platformBreakdown.netEarnings || 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSplitCard;
