import React from "react";
import { CreditCard, DollarSign } from "lucide-react";

const OrderPaymentInfo = ({ order, transactions = [] }) => {
  const getPaymentStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      succeeded: "bg-green-100 text-green-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800",
      partially_refunded: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace(/_/g, " ").toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <CreditCard className="w-5 h-5 mr-2" />
        Payment Information
      </h2>

      <div className="space-y-4">
        {/* Payment Status */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Payment Status:</span>
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>

        {/* Payment Method */}
        {order.paymentMethod && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Payment Method:</span>
            <span className="text-sm font-medium text-gray-900">
              {order.paymentMethod.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">
              R {order.subtotal?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee:</span>
            <span className="text-gray-900">
              R {order.deliveryFee?.toFixed(2) || "0.00"}
            </span>
          </div>

          {order.tip > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tip:</span>
              <span className="text-gray-900">R {order.tip.toFixed(2)}</span>
            </div>
          )}

          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="text-red-600">
                -R {order.discount.toFixed(2)}
              </span>
            </div>
          )}

          {order.appliedCoupon && (
            <div className="text-xs text-gray-500 italic">
              Coupon: {order.appliedCoupon.code} (
              {order.appliedCoupon.discountType})
            </div>
          )}

          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">
              R {order.total?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        {/* Payment Split */}
        {order.paymentSplit && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Payment Distribution
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Store Amount:</span>
                <span className="text-gray-900 font-medium">
                  R {order.paymentSplit.storeAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Driver Amount:</span>
                <span className="text-gray-900 font-medium">
                  R {order.paymentSplit.driverAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Amount:</span>
                <span className="text-gray-900 font-medium">
                  R {order.paymentSplit.platformAmount?.toFixed(2) || "0.00"}
                </span>
              </div>

              {order.paymentSplit.platformBreakdown && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Platform Markup:</span>
                    <span>
                      R{" "}
                      {order.paymentSplit.platformBreakdown.totalMarkup?.toFixed(
                        2,
                      ) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount Absorbed:</span>
                    <span className="text-red-600">
                      -R{" "}
                      {order.paymentSplit.platformBreakdown.discountAbsorbed?.toFixed(
                        2,
                      ) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900">
                    <span>Net Earnings:</span>
                    <span>
                      R{" "}
                      {order.paymentSplit.platformBreakdown.netEarnings?.toFixed(
                        2,
                      ) || "0.00"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions */}
        {transactions && transactions.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Related Transactions
            </h3>
            <div className="space-y-2">
              {transactions.map((transaction, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-gray-50 rounded p-2 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type}
                    </p>
                    <p className="text-gray-600">{transaction.description}</p>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.amount >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.amount >= 0 ? "+" : ""}R{" "}
                    {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPaymentInfo;
