import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Plus,
  Check,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  Heart,
  Navigation,
} from "lucide-react";
import { customerProfileAPI } from "../../services/api";
import LocationPicker from "../../components/LocationPicker";

const AddressPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [formData, setFormData] = useState({
    label: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "US",
    latitude: 0,
    longitude: 0,
    instructions: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
    // Automatically trigger location detection if no default address exists or on mount
    getCurrentLocation();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await customerProfileAPI.getAddresses();
      if (response.success) {
        setAddresses(response.data.addresses || []);
        setDefaultAddressId(response.data.defaultAddress);
      }
    } catch (err) {
      setError(err.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(
              "Location permission denied. Please enable location access in your browser settings.",
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An unknown error occurred while getting location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const resetForm = () => {
    setFormData({
      label: "",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "US",
      latitude: 0,
      longitude: 0,
      instructions: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
      instructions: address.instructions || "",
      isDefault: address.isDefault,
    });
    setEditingId(address._id);
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    // Open map picker instead of auto-getting location
    if (!editingId) {
      setShowMapPicker(true);
    }
  };

  const handleLocationSelected = async (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    setShowMapPicker(false);

    // Auto-fill address details
    try {
      setLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;

        // Construct detailed street address
        const streetParts = [
          addr.amenity,
          addr.building,
          addr.house_number,
          addr.road,
          addr.suburb,
          addr.neighbourhood,
          addr.hamlet,
          addr.industrial,
        ].filter(Boolean);

        setFormData((prev) => ({
          ...prev,
          street: streetParts.join(", ") || addr.road || "",
          city: addr.city || addr.town || addr.village || addr.county || "",
          province: addr.state || "",
          postalCode: addr.postcode || "",
          country: addr.country || "IN",
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");

      if (editingId) {
        // Update existing address
        const response = await customerProfileAPI.updateAddress(
          editingId,
          formData,
        );
        if (response.success) {
          setAddresses(response.data.addresses);
          resetForm();
        }
      } else {
        // Add new address
        const response = await customerProfileAPI.addAddress(formData);
        if (response.success) {
          setAddresses(response.data.addresses);
          resetForm();
        }
      }
    } catch (err) {
      setError(err.message || "Failed to save address");
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      setError("");
      const response = await customerProfileAPI.deleteAddress(addressId);
      if (response.success) {
        setAddresses(response.data.addresses);
      }
    } catch (err) {
      setError(err.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setError("");
      const response = await customerProfileAPI.setDefaultAddress(addressId);
      if (response.success) {
        setAddresses(response.data.addresses);
        setDefaultAddressId(response.data.defaultAddress);
      }
    } catch (err) {
      setError(err.message || "Failed to set default address");
    }
  };

  const getIconForLabel = (label) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("home")) return Home;
    if (lowerLabel.includes("work") || lowerLabel.includes("office"))
      return Briefcase;
    return Heart;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[rgb(49,134,22)] mb-3"></div>
          <p className="text-white/60 text-sm">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[rgb(49,134,22)]/30 font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 -ml-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">
            Saved Addresses
          </h1>
          <button
            onClick={handleAddNew}
            className="p-1.5 -mr-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <Plus className="w-5 h-5 text-[rgb(49,134,22)]" />
          </button>
        </div>
      </div>

      <div className="px-3 pt-3 pb-4">
        {/* Error Message */}
        {error && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-4 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/5 p-4">
            <h3 className="text-white font-semibold text-sm mb-3">
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-white/40 text-[11px] mb-1.5 block">
                  Label
                </label>
                <select
                  value={formData.label}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  required
                  className="w-full bg-white/5 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/5"
                >
                  <option value="" className="bg-zinc-900">
                    Select label
                  </option>
                  <option value="Home" className="bg-zinc-900">
                    Home
                  </option>
                  <option value="Work" className="bg-zinc-900">
                    Work
                  </option>
                  <option value="Other" className="bg-zinc-900">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="text-white/40 text-[11px] mb-1.5 block">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  required
                  className="w-full bg-white/5 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/5 placeholder:text-white/30"
                  placeholder="Street address"
                />
              </div>

              {/* Pick Location on Map Button */}
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {formData.latitude && formData.longitude
                    ? "Update Location on Map"
                    : "Pick Location on Map"}
                </span>
              </button>

              {/* Location Coordinates Display */}
              {formData.latitude !== 0 && formData.longitude !== 0 && (
                <div className="px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-3 h-3" />
                    <span className="font-medium">Location Set</span>
                  </div>
                  <div className="text-white/40">
                    Lat: {formData.latitude.toFixed(6)}, Lng:{" "}
                    {formData.longitude.toFixed(6)}
                  </div>
                </div>
              )}

              {/* Location Status */}
              {gettingLocation && (
                <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs flex items-center gap-2">
                  <Navigation className="w-3 h-3 animate-pulse" />
                  Getting your location...
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-[11px] mb-1.5 block">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                    className="w-full bg-white/5 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/5 placeholder:text-white/30"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-[11px] mb-1.5 block">
                    Province
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) =>
                      handleInputChange("province", e.target.value)
                    }
                    required
                    className="w-full bg-white/5 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/5 placeholder:text-white/30"
                    placeholder="Province"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/40 text-[11px] mb-1.5 block">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  required
                  className="w-full bg-white/5 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/5 placeholder:text-white/30"
                  placeholder="Postal code"
                />
              </div>

              <div>
                <label className="text-white/40 text-[11px] mb-1.5 block">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) =>
                    handleInputChange("instructions", e.target.value)
                  }
                  rows={2}
                  className="w-full bg-white/5 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/5 placeholder:text-white/30 resize-none"
                  placeholder="E.g., Ring the doorbell, Leave at door"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    handleInputChange("isDefault", e.target.checked)
                  }
                  className="w-4 h-4 rounded accent-[rgb(49,134,22)]"
                />
                <label htmlFor="isDefault" className="text-white text-sm">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-white/5 text-white text-sm rounded-lg active:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[rgb(49,134,22)] text-white text-sm font-medium rounded-lg active:bg-[rgb(49,134,22)]/90 transition-all"
                >
                  {editingId ? "Update" : "Add"} Address
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-4">No addresses saved yet</p>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-[rgb(49,134,22)] text-white text-sm font-medium rounded-lg"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {addresses.map((address) => {
              const Icon = getIconForLabel(address.label);
              const isDefault = address._id === defaultAddressId;

              return (
                <div
                  key={address._id}
                  className={`bg-white/[0.03] backdrop-blur-sm rounded-xl border p-3 ${
                    isDefault ? "border-[rgb(49,134,22)]/50" : "border-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isDefault ? "bg-[rgb(49,134,22)]/10" : "bg-white/5"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isDefault ? "text-[rgb(49,134,22)]" : "text-white/40"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium text-sm">
                          {address.label}
                        </h3>
                        {isDefault && (
                          <span className="px-2 py-0.5 bg-[rgb(49,134,22)]/10 text-[rgb(49,134,22)] text-[10px] font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed">
                        {address.street}, {address.city}, {address.province}{" "}
                        {address.postalCode}, {address.country}
                      </p>
                      {address.instructions && (
                        <p className="text-white/40 text-[11px] mt-1">
                          {address.instructions}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        {!isDefault && (
                          <button
                            onClick={() => handleSetDefault(address._id)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-white/70 text-[11px] rounded-lg active:bg-white/10 transition-all"
                          >
                            <Check className="w-3 h-3" />
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(address)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-white/70 text-[11px] rounded-lg active:bg-white/10 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(address._id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 text-[11px] rounded-lg active:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <LocationPicker
          initialLat={formData.latitude || 31.2552}
          initialLng={formData.longitude || 75.7009}
          onLocationSelect={handleLocationSelected}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
};

export default AddressPage;
