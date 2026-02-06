import React from "react";
import { MapPin } from "lucide-react";

const DeliveryAddressCard = ({ deliveryAddress }) => {
  if (!deliveryAddress) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-red-600" />
        Delivery Address
      </h3>
      <div className="space-y-2 text-sm">
        <p className="font-medium text-gray-900">{deliveryAddress.street}</p>
        <p className="text-gray-600">
          {deliveryAddress.city}, {deliveryAddress.province}
        </p>
        {deliveryAddress.postalCode && (
          <p className="text-gray-600">{deliveryAddress.postalCode}</p>
        )}
        {deliveryAddress.deliveryInstructions && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-600">
              Delivery Instructions:
            </span>
            <p className="text-gray-900 mt-1">
              {deliveryAddress.deliveryInstructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryAddressCard;
