import React from "react";
import { User } from "lucide-react";

const CustomerInfoCard = ({ customer }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
        <User className="w-4 h-4 mr-2 text-blue-600" />
        Customer Information
      </h3>
      <div className="space-y-2">
        <div className="flex items-start">
          {customer?.profilePhoto ? (
            <img
              src={customer.profilePhoto}
              alt=""
              className="h-10 w-10 rounded-full mr-3"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {customer?.name || "N/A"}
            </p>
            <p className="text-xs text-gray-600">{customer?.email || ""}</p>
            <p className="text-xs text-gray-600">{customer?.phone || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoCard;
