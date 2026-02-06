import React from "react";
import { Truck, User, Phone, Mail } from "lucide-react";

const RiderInfoCard = ({ rider }) => {
  if (!rider) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
        <Truck className="w-5 h-5 mr-2 text-indigo-600" />
        Rider Information
      </h3>
      <div className="flex items-center gap-3">
        {rider.profilePhoto ? (
          <img
            src={rider.profilePhoto}
            alt={rider.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{rider.name}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {rider.phone}
          </p>
          {rider.email && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {rider.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderInfoCard;
