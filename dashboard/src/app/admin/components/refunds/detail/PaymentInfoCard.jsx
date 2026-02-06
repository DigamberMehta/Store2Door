import React from "react";
import { CreditCard, AlertCircle } from "lucide-react";

const PaymentInfoCard = ({ order }) => {
  const paymentId = order?.paymentId;

  const getPaymentStatusClass = (status) => {
    if (status === "completed" || status === "succeeded")
      return "bg-green-100 text-green-800 border-2 border-green-400";
    if (status === "pending" || status === "processing")
      return "bg-yellow-100 text-yellow-800 border-2 border-yellow-400";
    if (status === "failed")
      return "bg-red-100 text-red-800 border-2 border-red-400";
    if (status === "refunded")
      return "bg-purple-100 text-purple-800 border-2 border-purple-400";
    return "bg-gray-100 text-gray-800 border-2 border-gray-400";
  };

  // Payment completed
  if (paymentId) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
          Payment Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Payment Number:</span>
            <p className="font-medium text-gray-900 mt-1">
              {paymentId.paymentNumber || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Payment Status:</span>
            <p className="mt-1">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase inline-block ${getPaymentStatusClass(paymentId.status)}`}
              >
                {paymentId.status || "N/A"}
              </span>
            </p>
          </div>
          <div>
            <span className="text-gray-600">Payment Method:</span>
            <p className="font-medium text-gray-900 mt-1 capitalize">
              {paymentId.method?.replace(/_/g, " ") ||
                order?.paymentMethod?.replace(/_/g, " ") ||
                "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Amount Paid:</span>
            <p className="font-medium text-gray-900 mt-1">
              R {paymentId.amount?.toFixed(2) || "0.00"}
            </p>
          </div>
          {paymentId.paystackReference && (
            <div>
              <span className="text-gray-600">Paystack Reference:</span>
              <p className="font-medium text-gray-900 mt-1 text-xs">
                {paymentId.paystackReference}
              </p>
            </div>
          )}
          {paymentId.transactionId && (
            <div>
              <span className="text-gray-600">Transaction ID:</span>
              <p className="font-medium text-gray-900 mt-1 text-xs">
                {paymentId.transactionId}
              </p>
            </div>
          )}
          {paymentId.cardDetails?.lastFour && (
            <div className="col-span-2">
              <span className="text-gray-600">Card Details:</span>
              <p className="font-medium text-gray-900 mt-1">
                {paymentId.cardDetails.brand?.toUpperCase()} ••••{" "}
                {paymentId.cardDetails.lastFour}
              </p>
            </div>
          )}
          {paymentId.completedAt && (
            <div>
              <span className="text-gray-600">Payment Completed:</span>
              <p className="font-medium text-gray-900 mt-1">
                {new Date(paymentId.completedAt).toLocaleString("en-ZA")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Payment not completed
  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl shadow-sm p-6">
      <h3 className="text-base font-bold text-amber-900 mb-4 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
        Payment Information
      </h3>
      <div className="space-y-3">
        {/* Payment Status - Prominent */}
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
            Payment Status
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-bold uppercase ${getPaymentStatusClass(order?.paymentStatus)}`}
            >
              {order?.paymentStatus || "Unknown"}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        {order?.paymentMethod && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Payment Method:</span>
              <p className="font-semibold text-gray-900 mt-1 capitalize">
                {order.paymentMethod.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Order Total:</span>
              <p className="font-semibold text-gray-900 mt-1">
                R {(order?.total || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mt-3">
          <p className="text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>No Payment Transaction Record:</strong> The customer
              attempted to pay via{" "}
              {order?.paymentMethod?.replace(/_/g, " ") || "card"}, but the
              payment was never completed. Payment status remains{" "}
              <strong className="uppercase">
                {order?.paymentStatus || "unknown"}
              </strong>
              .
            </span>
          </p>
        </div>

        {/* Cancellation Reason */}
        {order?.cancellationReason && (
          <div className="pt-2 border-t border-amber-200">
            <span className="text-xs font-semibold text-gray-600">
              Cancellation Reason:
            </span>
            <p className="text-sm text-gray-900 mt-1 font-medium">
              {order.cancellationReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentInfoCard;
