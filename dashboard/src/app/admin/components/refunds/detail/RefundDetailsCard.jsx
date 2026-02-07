import React from "react";
import { DollarSign } from "lucide-react";

const RefundDetailsCard = ({ refund }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-md">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
        Refund Request Details
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {refund.approvedAmount && (
          <div>
            <span className="text-gray-600">Approved Amount:</span>
            <p className="text-xl font-bold text-green-600 mt-1">
              R {refund.approvedAmount.toFixed(2)}
            </p>
          </div>
        )}
        <div>
          <span className="text-gray-600">Reason:</span>
          <p className="font-medium text-gray-900 mt-1">
            {refund.refundReason.replace(/_/g, " ")}
          </p>
        </div>
        <div>
          <span className="text-gray-600">Submitted:</span>
          <p className="font-medium text-gray-900 mt-1">
            {new Date(refund.createdAt).toLocaleString("en-ZA")}
          </p>
        </div>
      </div>

      {refund.customerNote && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <span className="text-xs font-medium text-gray-600">
            Customer Note:
          </span>
          <p className="text-sm text-gray-900 mt-1">{refund.customerNote}</p>
        </div>
      )}
    </div>
  );
};

export default RefundDetailsCard;
