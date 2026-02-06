import React from "react";
import { Store as StoreIcon, Phone, Mail, MapPin } from "lucide-react";

const StoreDetailsCard = ({ store }) => {
  if (!store) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
        <StoreIcon className="w-5 h-5 mr-2 text-cyan-600" />
        Store Details
      </h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {store.logo && (
            <img
              src={store.logo}
              alt={store.name}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-gray-900">{store.name}</p>
            {store.averageRating !== undefined &&
              store.averageRating !== null && (
                <p className="text-sm text-gray-600">
                  ⭐ {store.averageRating.toFixed(1)} ({store.reviewCount || 0}{" "}
                  reviews)
                </p>
              )}
          </div>
        </div>
        {store.phone && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {store.phone}
          </p>
        )}
        {store.email && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {store.email}
          </p>
        )}
        {store.address && (
          <p className="text-sm text-gray-600 flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5" />
            <span>
              {store.address.street}, {store.address.city}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StoreDetailsCard;
