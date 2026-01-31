import { useState, useEffect } from "react";
import { Save, AlertCircle, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { storeAPI } from "../../../../services/store/api/store.api";
import { uploadAPI } from "../../../../services/store/api/upload.api";

const StoreProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingStore, setFetchingStore] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    coverImage: "",
    businessLicense: "",
    taxId: "",
    businessType: [],
  });

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const fetchStoreProfile = async () => {
    try {
      setFetchingStore(true);
      const response = await storeAPI.getMyProfile();

      if (response.success) {
        const store = response.data;
        setFormData({
          name: store.name || "",
          description: store.description || "",
          logo: store.logo || "",
          coverImage: store.coverImage || "",
          businessLicense: store.businessLicense || "",
          taxId: store.taxId || "",
          businessType: store.businessType || [],
        });
      }
    } catch (error) {
      console.error("Error fetching store:", error);
      toast.error("Failed to load store profile");
    } finally {
      setFetchingStore(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessTypeChange = (typeValue) => {
    setFormData((prev) => ({
      ...prev,
      businessType: prev.businessType.includes(typeValue)
        ? prev.businessType.filter((t) => t !== typeValue)
        : [...prev.businessType, typeValue],
    }));
  };

  const handleImageUpload = async (field, file) => {
    try {
      setUploading(true);
      const response = await uploadAPI.uploadStoreImage(file);

      if (response.success) {
        setFormData((prev) => ({ ...prev, [field]: response.data.url }));
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await storeAPI.update(formData);

      if (response.success) {
        toast.success("Store profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error("Failed to update store profile");
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    { value: "restaurant", label: "Restaurant" },
    { value: "grocery", label: "Grocery" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion" },
    { value: "books", label: "Books" },
    { value: "beauty", label: "Beauty" },
    { value: "home_garden", label: "Home & Garden" },
    { value: "sports", label: "Sports" },
    { value: "toys", label: "Toys" },
    { value: "automotive", label: "Automotive" },
    { value: "pet_supplies", label: "Pet Supplies" },
    { value: "bakery", label: "Bakery" },
    { value: "meat_seafood", label: "Meat & Seafood" },
    { value: "dairy", label: "Dairy" },
    { value: "beverages", label: "Beverages" },
    { value: "snacks", label: "Snacks" },
    { value: "frozen_foods", label: "Frozen Foods" },
    { value: "organic", label: "Organic" },
    { value: "convenience_store", label: "Convenience Store" },
    { value: "supermarket", label: "Supermarket" },
    { value: "specialty_store", label: "Specialty Store" },
    { value: "other", label: "Other" },
  ];

  if (fetchingStore) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading store profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <h1 className="text-lg font-bold text-gray-900">Store Profile</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your store basic information
        </p>
      </div>

      <div className="px-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Store Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  placeholder="Enter store name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none"
                  placeholder="Brief description of your store"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Store Logo
                </label>
                <div className="flex items-start gap-4">
                  {formData.logo && (
                    <div className="relative w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden">
                      <img
                        src={formData.logo}
                        alt="Store logo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, logo: "" }))
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleImageUpload("logo", e.target.files[0])
                      }
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 text-center">
                        Click to upload logo
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cover Image
                </label>
                <div className="space-y-3">
                  {formData.coverImage && (
                    <div className="relative w-full h-48 rounded-lg border-2 border-gray-200 overflow-hidden">
                      <img
                        src={formData.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, coverImage: "" }))
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleImageUpload("coverImage", e.target.files[0])
                      }
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 text-center">
                        Click to upload cover image
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        Recommended: 1200x400px, PNG or JPG
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Business Information
            </h2>

            <div className="space-y-4">
              {/* Business License */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Business License Number
                </label>
                <input
                  type="text"
                  name="businessLicense"
                  value={formData.businessLicense}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  placeholder="Enter business license number"
                />
              </div>

              {/* Tax ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tax ID / VAT Number
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  placeholder="Enter tax ID or VAT number"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Business Type
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Select all that apply to your store
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {businessTypes.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:border-green-500 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.businessType.includes(type.value)}
                        onChange={() => handleBusinessTypeChange(type.value)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500/20"
                      />
                      <span className="text-sm text-gray-700">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || uploading}
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
        </form>
      </div>
    </div>
  );
};

export default StoreProfilePage;
