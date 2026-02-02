import { MapPin, Home, ExternalLink } from "lucide-react";
import { useState } from "react";

const CustomerProfileSection = ({ profile, userId }) => {
  const [showAddressModal, setShowAddressModal] = useState(false);

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

  const displayedAddresses = profile.addresses?.slice(0, 3) || [];
  const hasMoreAddresses = profile.addresses && profile.addresses.length > 3;

  return (
    <>
      <div className="space-y-4">
        {/* Personal Information */}
        {(profile.dateOfBirth || profile.gender) && (
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
        )}

        {/* Addresses */}
        {profile.addresses && profile.addresses.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">
                Delivery Addresses ({profile.addresses.length})
              </h2>
              {hasMoreAddresses && (
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-200">
              {displayedAddresses.map((address, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 py-3 first:pt-0"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {address.label}
                      </span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.street}, {address.city}, {address.province}{" "}
                      {address.postalCode}
                    </p>
                    {address.instructions && (
                      <p className="text-xs text-gray-500 mt-1 italic">
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

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                All Delivery Addresses
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="divide-y divide-gray-200">
                {profile.addresses.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 py-3 first:pt-0"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.street}, {address.city}, {address.province}{" "}
                        {address.postalCode}
                      </p>
                      {address.instructions && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          Note: {address.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerProfileSection;
