import { MapPin, Home } from "lucide-react";

const CustomerProfileSection = ({ profile }) => {
  if (!profile) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Profile
        </h2>
        <p className="text-gray-500">No profile data available</p>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.dateOfBirth && (
            <div>
              <span className="text-xs text-gray-500">Date of Birth</span>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(profile.dateOfBirth)}
              </p>
            </div>
          )}
          {profile.gender && (
            <div>
              <span className="text-xs text-gray-500">Gender</span>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {profile.gender.replace("_", " ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Addresses */}
      {profile.addresses && profile.addresses.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Delivery Addresses
          </h2>
          <div className="space-y-3">
            {profile.addresses.map((address, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {address.street}, {address.city}, {address.province}{" "}
                    {address.postalCode}
                  </p>
                  {address.instructions && (
                    <p className="text-gray-500 text-sm mt-1 italic">
                      Note: {address.instructions}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences */}
      {profile.preferences && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Preferences
          </h2>
          <div className="space-y-3">
            {profile.preferences.preferredCategories &&
              profile.preferences.preferredCategories.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">
                    Preferred Categories
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.preferences.preferredCategories.map(
                      (category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {category}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

            {profile.preferences.dietaryRestrictions &&
              profile.preferences.dietaryRestrictions.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">
                    Dietary Restrictions
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.preferences.dietaryRestrictions.map(
                      (restriction, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full capitalize"
                        >
                          {restriction.replace("_", " ")}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

            {profile.preferences.spiceLevel && (
              <div>
                <span className="text-sm text-gray-500">Spice Level</span>
                <p className="font-medium text-gray-900 capitalize mt-1">
                  {profile.preferences.spiceLevel.replace("_", " ")}
                </p>
              </div>
            )}

            {profile.preferences.deliveryInstructions && (
              <div>
                <span className="text-sm text-gray-500">
                  Delivery Instructions
                </span>
                <p className="text-gray-900 mt-1">
                  {profile.preferences.deliveryInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfileSection;
