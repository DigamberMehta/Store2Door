import { Store, MapPin, Phone, Mail, Clock } from "lucide-react";

const StoreManagerSection = ({ storeData }) => {
  if (!storeData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Store Information
        </h2>
        <p className="text-gray-500">No store assigned</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Store className="w-4 h-4 text-gray-700" />
        <h2 className="text-base font-semibold text-gray-900">
          Store Information
        </h2>
      </div>

      <div className="space-y-3">
        {/* Store Name */}
        <div>
          <span className="text-sm text-gray-500">Store Name</span>
          <p className="text-xl font-semibold text-gray-900">
            {storeData.name}
          </p>
        </div>

        {/* Address */}
        {storeData.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <span className="text-sm text-gray-500">Address</span>
              <p className="text-gray-900">
                {storeData.address.street}, {storeData.address.city},{" "}
                {storeData.address.province} {storeData.address.postalCode}
              </p>
            </div>
          </div>
        )}

        {/* Contact */}
        {storeData.contactInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {storeData.contactInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-xs text-gray-500">Phone</span>
                  <p className="text-sm font-medium text-gray-900">
                    {storeData.contactInfo.phone}
                  </p>
                </div>
              </div>
            )}
            {storeData.contactInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">Email</span>
                  <p className="font-medium text-gray-900">
                    {storeData.contactInfo.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <p
              className={`font-medium ${storeData.isActive ? "text-green-600" : "text-red-600"}`}
            >
              {storeData.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          {storeData.isOpen !== undefined && (
            <div>
              <span className="text-sm text-gray-500">Currently</span>
              <p
                className={`font-medium ${storeData.isOpen ? "text-green-600" : "text-gray-500"}`}
              >
                {storeData.isOpen ? "Open" : "Closed"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreManagerSection;
