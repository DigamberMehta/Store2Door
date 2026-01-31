import { useState, useEffect } from "react";
import {
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { storeAPI } from "../../../../services/store/api/store.api";

const LocationContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingStore, setFetchingStore] = useState(true);
  const isReadOnly = true; // Store managers can only view, not edit

  const [formData, setFormData] = useState({
    address: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "ZA",
      latitude: null,
      longitude: null,
    },
    contactInfo: {
      phone: "",
      email: "",
      website: "",
      socialMedia: {
        facebook: "",
        instagram: "",
        twitter: "",
      },
    },
  });

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const fetchStoreProfile = async () => {
    try {
      setFetchingStore(true);
      const response = await storeAPI.getMyLocation();

      if (response.success) {
        const store = response.data;
        setFormData({
          address: {
            street: store.address?.street || "",
            city: store.address?.city || "",
            province: store.address?.province || "",
            postalCode: store.address?.postalCode || "",
            country: store.address?.country || "ZA",
            latitude: store.address?.latitude || null,
            longitude: store.address?.longitude || null,
          },
          contactInfo: {
            phone: store.contactInfo?.phone || "",
            email: store.contactInfo?.email || "",
            website: store.contactInfo?.website || "",
            socialMedia: {
              facebook: store.contactInfo?.socialMedia?.facebook || "",
              instagram: store.contactInfo?.socialMedia?.instagram || "",
              twitter: store.contactInfo?.socialMedia?.twitter || "",
            },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching store:", error);
      toast.error("Failed to load location & contact info");
    } finally {
      setFetchingStore(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [name]: value },
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        socialMedia: {
          ...prev.contactInfo.socialMedia,
          [name]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await storeAPI.update(formData);

      if (response.success) {
        toast.success("Location & contact updated successfully!");
      }
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error("Failed to update location & contact");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingStore) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <h1 className="text-lg font-bold text-gray-900">Location & Contact</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your store location and contact information
        </p>
      </div>

      {/* Read-Only Notice */}
      {isReadOnly && (
        <div className="px-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Read-Only Mode</p>
              <p className="text-sm text-blue-700 mt-1">
                Contact your administrator to edit location & contact settings
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                    disabled={isReadOnly}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.address.province}
                    onChange={handleAddressChange}
                    disabled={isReadOnly}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                    placeholder="Enter province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.address.postalCode}
                    onChange={handleAddressChange}
                    disabled={isReadOnly}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                    placeholder="Enter postal code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.address.country}
                    onChange={handleAddressChange}
                    disabled={true}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.address.latitude || ""}
                    onChange={handleAddressChange}
                    disabled={true}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                    placeholder="Auto-set"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.address.longitude || ""}
                    onChange={handleAddressChange}
                    disabled={true}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                    placeholder="Auto-set"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Contact Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.contactInfo.phone}
                  onChange={handleContactChange}
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.contactInfo.email}
                  onChange={handleContactChange}
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.contactInfo.website}
                  onChange={handleContactChange}
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                  placeholder="Enter website URL"
                />
              </div>
            </div>
          </div>

          {/* Social Media Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Social Media
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Facebook className="w-5 h-5 text-blue-600" />
                <input
                  type="text"
                  name="facebook"
                  value={formData.contactInfo.socialMedia.facebook}
                  onChange={handleSocialChange}
                  disabled={isReadOnly}
                  placeholder="Facebook URL"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-pink-600" />
                <input
                  type="text"
                  name="instagram"
                  value={formData.contactInfo.socialMedia.instagram}
                  onChange={handleSocialChange}
                  disabled={isReadOnly}
                  placeholder="Instagram URL"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <Twitter className="w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  name="twitter"
                  value={formData.contactInfo.socialMedia.twitter}
                  onChange={handleSocialChange}
                  disabled={isReadOnly}
                  placeholder="Twitter URL"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {!isReadOnly && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LocationContactPage;
