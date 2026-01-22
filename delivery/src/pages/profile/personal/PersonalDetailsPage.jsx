import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driverProfileAPI } from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";
import {
  LuArrowLeft,
  LuUser,
  LuMail,
  LuPhone,
  LuCalendar,
  LuMapPin,
} from "react-icons/lu";

const PersonalDetailsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
    },
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await driverProfileAPI.getProfile();
      setProfileData(response.data);

      // Pre-fill form data
      setFormData({
        name: response.data.user?.name || "",
        email: response.data.user?.email || "",
        phone: response.data.user?.phone || "",
        dateOfBirth: response.data.profile?.dateOfBirth?.split("T")[0] || "",
        address: {
          street: response.data.profile?.address?.street || "",
          city: response.data.profile?.address?.city || "",
          province: response.data.profile?.address?.province || "",
          postalCode: response.data.profile?.address?.postalCode || "",
        },
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setUpdating(true);

      // Update profile (DOB and address)
      await driverProfileAPI.updateProfile({
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
      });

      toast.success("Personal details updated successfully!");
      await fetchProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pb-8">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/5 p-1.5 rounded-full border border-white/5 active:scale-90 transition-transform"
          >
            <LuArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div>
            <p className="text-lg font-bold">Personal Details</p>
            <p className="text-[10px] text-zinc-500">Update your information</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 pt-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
            Basic Information
          </h3>

          {/* Full Name - Read Only */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium px-1 flex items-center gap-2">
              <LuUser className="w-3.5 h-3.5" />
              Full Name
            </label>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-500">
              {formData.name}
            </div>
            <p className="text-[9px] text-zinc-600 px-1">
              Name cannot be changed here
            </p>
          </div>

          {/* Email - Read Only */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium px-1 flex items-center gap-2">
              <LuMail className="w-3.5 h-3.5" />
              Email Address
            </label>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-500">
              {formData.email}
            </div>
            <p className="text-[9px] text-zinc-600 px-1">
              Email cannot be changed here
            </p>
          </div>

          {/* Phone - Read Only */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium px-1 flex items-center gap-2">
              <LuPhone className="w-3.5 h-3.5" />
              Phone Number
            </label>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-500">
              {formData.phone}
            </div>
            <p className="text-[9px] text-zinc-600 px-1">
              Phone cannot be changed here
            </p>
          </div>

          {/* Date of Birth - Editable */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium px-1 flex items-center gap-2">
              <LuCalendar className="w-3.5 h-3.5" />
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1 flex items-center gap-2">
            <LuMapPin className="w-3.5 h-3.5" />
            Address Information
          </h3>

          {/* Street Address */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium px-1">
              Street Address
            </label>
            <input
              type="text"
              name="street"
              value={formData.address.street}
              onChange={handleAddressChange}
              placeholder="Enter your street address"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>

          {/* City and Province */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium px-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                placeholder="City"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium px-1">
                Province
              </label>
              <input
                type="text"
                name="province"
                value={formData.address.province}
                onChange={handleAddressChange}
                placeholder="Province"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium px-1">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.address.postalCode}
              onChange={handleAddressChange}
              placeholder="Enter postal code"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={updating}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {updating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};

export default PersonalDetailsPage;
