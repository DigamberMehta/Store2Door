import { MapPin, ChevronDown, Check, Plus, X, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import { customerProfileAPI } from "../../services/api/profile.api";
import { formatPrice } from "../../utils/formatPrice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useUserLocation } from "../../hooks/useUserLocation";

const CheckoutFooter = ({ total, orderData }) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [allAddresses, setAllAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const navigate = useNavigate();
  const { latitude, longitude, address: detectedAddressName } = useUserLocation();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await customerProfileAPI.getAddresses();
      const addresses = response?.data?.addresses || response?.addresses || [];
      setAllAddresses(addresses);

      // Select default address or first one
      const primary = addresses.find((addr) => addr.isDefault) || addresses[0];
      setSelectedAddress(primary);
    } catch (error) {
      console.error("Error fetching address:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) {
      if (detectedAddressName) return detectedAddressName;
      if (latitude && longitude) return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      return "No address added";
    }
    const parts = [
      address.street,
      address.city,
      address.province,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress && !latitude) {
      toast.error("Please add a delivery address or enable location");
      return;
    }

    // Convert address to GeoJSON format for backend
    let transformedAddress;
    
    if (selectedAddress) {
      transformedAddress = {
        street: selectedAddress.street,
        city: selectedAddress.city,
        province: selectedAddress.province,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country || "ZA",
        label: selectedAddress.label,
        instructions: selectedAddress.instructions || "",
        location: {
          type: "Point",
          coordinates: [
            selectedAddress.longitude ||
              selectedAddress.location?.coordinates?.[0] ||
              28.0473,
            selectedAddress.latitude ||
              selectedAddress.location?.coordinates?.[1] ||
              -26.2041,
          ],
        },
      };
    } else {
      // Use detected location if no address selected
      transformedAddress = {
        street: detectedAddressName || "Detected Location",
        city: "Detected City",
        province: "Detected Province",
        postalCode: "0000",
        country: "ZA",
        label: "Current Location",
        instructions: "Delivering to current GPS location",
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      };
    }

    // Include the transformed address in the order data
    const updatedOrderData = {
      ...orderData,
      deliveryAddress: transformedAddress,
    };

    // Navigate to payment page with updated order data
    navigate("/payment", {
      state: { orderData: updatedOrderData },
    });
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/10 z-10">
        {/* Delivery Address */}
        <div className="px-3 pt-3 pb-2 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="p-1 bg-white/5 rounded-lg flex-shrink-0">
                {selectedAddress ? (
                  <MapPin className="w-4 h-4 text-[rgb(49,134,22)]" />
                ) : (
                  <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-xs mb-1">
                  {loading
                    ? "Loading..."
                    : selectedAddress
                      ? `Delivering to ${selectedAddress.label || "Home"}`
                      : detectedAddressName 
                        ? "Delivering to Nearby Area"
                        : "No address selected"}
                </h3>
                <p className={`text-[10px] line-clamp-2 ${!selectedAddress && detectedAddressName ? 'text-blue-300' : 'text-white/60'}`}>
                  {loading ? "..." : formatAddress(selectedAddress)}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile/addresses")}
              className="text-[rgb(49,134,22)] text-xs font-medium hover:text-[rgb(49,134,22)]/80 transition-colors flex-shrink-0 ml-2"
            >
              {selectedAddress ? "Change" : "Add Address"}
            </button>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="px-3 py-3">
          <button
            onClick={handlePlaceOrder}
            disabled={(loading || (!selectedAddress && !latitude))}
            className="w-full bg-[rgb(49,134,22)] hover:bg-[rgb(49,134,22)]/90 text-white rounded-lg py-2 px-3 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[rgb(49,134,22)]/20 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-left">
              <div className="text-black/70 text-[10px]">TOTAL</div>
              <div className="text-black font-bold text-base">
                {formatPrice(total)}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">Place Order</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-white/10 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Select delivery address
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-3 flex-1">
              {allAddresses.map((addr) => (
                <button
                  key={addr._id}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setShowAddressModal(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedAddress?._id === addr._id
                      ? "border-[rgb(49,134,22)] bg-[rgb(49,134,22)]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          selectedAddress?._id === addr._id
                            ? "bg-[rgb(49,134,22)]/20 text-[rgb(49,134,22)]"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-sm">
                            {addr.label || "Address"}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 line-clamp-2">
                          {formatAddress(addr)}
                        </p>
                      </div>
                    </div>
                    {selectedAddress?._id === addr._id && (
                      <Check className="w-4 h-4 text-[rgb(49,134,22)]" />
                    )}
                  </div>
                </button>
              ))}

              <button
                onClick={() => navigate("/profile/addresses")}
                className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutFooter;
