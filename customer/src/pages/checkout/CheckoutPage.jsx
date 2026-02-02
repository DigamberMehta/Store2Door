import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Share2,
  Minus,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import cartAPI from "../../services/api/cart.api";
import { createOrder } from "../../services/api/order.api";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../services/api/client";
import { customerProfileAPI } from "../../services/api/profile.api";
import RecommendedProducts from "./RecommendedProducts";
import BillDetails from "./BillDetails";
import CheckoutFooter from "./CheckoutFooter";
import CouponSection from "./CouponSection";
import TipSection from "./TipSection";
import { CheckoutPageShimmer } from "../../components/shimmer";
import { formatPrice } from "../../utils/formatPrice";
import "./scrollbar.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [tip, setTip] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [deliveryFeeAmount, setDeliveryFeeAmount] = useState(30);
  const [deliverySettings, setDeliverySettings] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);

  // Fetch delivery settings on mount
  // Fetch delivery settings on mount
  useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        const response = await apiClient.get("/delivery-settings");
        // apiClient already extracts response.data, so response is the data object
        setDeliverySettings(response.data || response);
      } catch (error) {
        console.error("Error fetching delivery settings:", error);
      }
    };
    fetchDeliverySettings();
  }, []);

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await customerProfileAPI.getAddresses();
        setUserAddresses(
          response?.data?.addresses || response?.addresses || [],
        );
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Fetch cart on mount and when navigating to this page
  useEffect(() => {
    fetchCart();
  }, [location.pathname]); // Refetch when route changes

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(response?.data || response); // Extract data from response
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    // Optimistic update - update UI immediately
    const previousCart = { ...cart };
    const updatedItems = cart.items.map((item) =>
      item._id === itemId ? { ...item, quantity: newQuantity } : item,
    );

    // Calculate new subtotal
    const newSubtotal = updatedItems.reduce(
      (sum, item) =>
        sum + (item.discountedPrice || item.unitPrice || 0) * item.quantity,
      0,
    );

    setCart({
      ...cart,
      items: updatedItems,
      subtotal: newSubtotal,
      totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
    });

    try {
      // Make the actual API call
      const response = await cartAPI.updateCartItem(itemId, newQuantity);
      // Update with server response
      setCart(response?.data || response);
    } catch (error) {
      console.error("Error updating cart item:", error);
      // Revert to previous state on error
      setCart(previousCart);
    }
  };

  const removeItem = async (itemId) => {
    // Optimistic update - update UI immediately
    const previousCart = { ...cart };
    const updatedItems = cart.items.filter((item) => item._id !== itemId);

    // Calculate new subtotal
    const newSubtotal = updatedItems.reduce(
      (sum, item) =>
        sum + (item.discountedPrice || item.unitPrice || 0) * item.quantity,
      0,
    );

    setCart({
      ...cart,
      items: updatedItems,
      subtotal: newSubtotal,
      totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
    });

    try {
      // Make the actual API call
      const response = await cartAPI.removeFromCart(itemId);
      // Update with server response
      setCart(response?.data || response);
    } catch (error) {
      console.error("Error removing from cart:", error);
      // Revert to previous state on error
      setCart(previousCart);
    }
  };

  const clearAllItems = async () => {
    try {
      setUpdating(true);
      await cartAPI.clearCart();
      await fetchCart();
      setShowClearConfirm(false);
      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyCoupon = async (couponCode) => {
    try {
      setIsApplyingCoupon(true);
      const response = await cartAPI.applyCoupon(couponCode);
      setCart(response?.data || response);
      toast.success(response?.message || "Coupon applied successfully!");
      return true;
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(error.response?.data?.message || "Failed to apply coupon");
      return false;
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      setIsApplyingCoupon(true);
      const response = await cartAPI.removeCoupon();
      setCart(response?.data || response);
      toast.success("Coupon removed successfully");
    } catch (error) {
      console.error("Error removing coupon:", error);
      toast.error("Failed to remove coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleTipChange = (amount) => {
    setTip(amount);
  };

  const handlePlaceOrder = async (paymentData) => {
    try {
      // Get user's default address or first address
      const userAddress =
        user?.addresses?.find((addr) => addr.isDefault) || user?.addresses?.[0];

      // Convert address format to GeoJSON if needed
      let deliveryAddress;
      if (userAddress) {
        deliveryAddress = {
          street: userAddress.street,
          city: userAddress.city,
          province: userAddress.province,
          postalCode: userAddress.postalCode,
          country: userAddress.country || "ZA",
          label: userAddress.label,
          instructions: userAddress.instructions,
          location: {
            type: "Point",
            coordinates: [
              userAddress.longitude ||
                userAddress.location?.coordinates?.[0] ||
                28.0473,
              userAddress.latitude ||
                userAddress.location?.coordinates?.[1] ||
                -26.2041,
            ],
          },
        };
      } else {
        deliveryAddress = {
          street: "Default Street",
          city: "Default City",
          province: "Default Province",
          postalCode: "0000",
          location: {
            type: "Point",
            coordinates: [28.0473, -26.2041], // Default Johannesburg coordinates
          },
        };
      }

      // Only send product IDs, quantities, and user choices - backend calculates prices
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.productId?._id || item.productId,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant,
        })),
        deliveryAddress,
        couponCode: appliedCoupon?.code,
        tip,
        paymentMethod:
          paymentData.paymentMethod ||
          paymentData.payment?.method ||
          "yoco_card",
        paymentId: paymentData.payment?._id,
      };

      const response = await createOrder(orderPayload);
      toast.success("Order placed successfully!");
      return response;
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create order";
      toast.error(errorMessage);
      throw error;
    }
  };

  const cartItems = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const appliedCoupon = cart?.appliedCoupon?.code ? cart.appliedCoupon : null;
  const discount = appliedCoupon?.discountAmount || 0;
  const isFreeDelivery = appliedCoupon?.discountType === "free_delivery";

  // Calculate delivery fee based on distance
  useEffect(() => {
    const calculateDeliveryFee = () => {
      if (!cart || !deliverySettings) {
        setDeliveryFeeAmount(30);
        return;
      }

      // Get delivery address from location state (passed from address selection)
      const deliveryAddress =
        location.state?.deliveryAddress ||
        userAddresses?.find((addr) => addr.isDefault) ||
        userAddresses?.[0];
      const store = cart?.storeId;

      if (!store?.address?.latitude || !store?.address?.longitude) {
        // Default to first tier if no store location
        const defaultCharge =
          deliverySettings?.distanceTiers?.[0]?.charge || 30;
        setDeliveryFeeAmount(defaultCharge);
        return;
      }

      // Calculate distance using Haversine formula
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371; // Earth's radius in km

      // Handle both location.coordinates format and direct latitude/longitude format
      const userLat =
        deliveryAddress?.location?.coordinates?.[1] ||
        deliveryAddress?.latitude;
      const userLon =
        deliveryAddress?.location?.coordinates?.[0] ||
        deliveryAddress?.longitude;
      const storeLat = store.address.latitude;
      const storeLon = store.address.longitude;

      if (!userLat || !userLon) {
        // Default to first tier if no user location
        const defaultCharge =
          deliverySettings?.distanceTiers?.[0]?.charge || 30;
        setDeliveryFeeAmount(defaultCharge);
        return;
      }

      const dLat = toRad(storeLat - userLat);
      const dLon = toRad(storeLon - userLon);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLat)) *
          Math.cos(toRad(storeLat)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Find the appropriate tier
      const sortedTiers = [...deliverySettings.distanceTiers].sort(
        (a, b) => a.maxDistance - b.maxDistance,
      );
      const tier = sortedTiers.find((t) => distance <= t.maxDistance);
      const charge = tier
        ? tier.charge
        : sortedTiers[sortedTiers.length - 1].charge;

      setDeliveryFeeAmount(charge);
    };

    calculateDeliveryFee();
  }, [cart, deliverySettings, location.state, userAddresses]);

  const deliveryFee = isFreeDelivery ? 0 : deliveryFeeAmount;
  const total = subtotal + deliveryFee + tip - discount;

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: "My Cart",
        text: `I have ${cartItems.length} items in my cart`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Checkout</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <Share2 className="w-4 h-4 text-[rgb(49,134,22)]" />
            </button>
            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Clear cart"
              >
                <Trash2 className="w-4 h-4 text-white/60 hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <CheckoutPageShimmer />
      ) : (
        <>
          {/* Cart Items */}
          <div className="pb-32">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-3">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-12 h-12 text-white/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-1">
                  Your cart is empty
                </h2>
                <p className="text-white/60 text-center mb-4 text-sm">
                  Add items to your cart to get started
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-[rgb(49,134,22)] hover:bg-[rgb(49,134,22)]/90 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="px-3 py-3 space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3"
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={item.image || item.productId?.images?.[0]?.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {/* Store Name - Clickable */}
                          {item.storeId && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/store/${item.storeId.slug || item.storeId._id}`,
                                )
                              }
                              className="text-[9px] text-[rgb(49,134,22)] hover:text-[rgb(60,160,30)] font-medium mb-0.5 transition-colors text-left"
                            >
                              {item.storeId.name}
                            </button>
                          )}

                          <h3 className="font-medium text-white mb-1 line-clamp-2 text-xs leading-snug">
                            {item.name}
                            {item.selectedVariant && (
                              <span className="text-white/60">
                                {" "}
                                | {item.selectedVariant.value}
                              </span>
                            )}
                          </h3>
                          {item.description && (
                            <p className="text-[10px] text-white/40 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Delete button - Below product info */}
                        <button
                          onClick={() => removeItem(item._id)}
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors text-[10px] mt-1 w-fit"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <div className="text-base font-bold text-[rgb(49,134,22)]">
                            R
                            {formatPrice(
                              item.discountedPrice || item.unitPrice,
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-1 py-1">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            className="text-white/60 hover:text-white transition-colors w-5 h-5 flex items-center justify-center disabled:opacity-50"
                            disabled={item.quantity <= 1 || updating}
                          >
                            <Minus className="w-2 h-2" />
                          </button>
                          <span className="font-medium text-xs w-5 text-center text-[rgb(49,134,22)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            className="text-white/60 hover:text-white transition-colors w-5 h-5 flex items-center justify-center disabled:opacity-50"
                            disabled={updating}
                          >
                            <Plus className="w-2 h-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommended Products Section */}
            {/* {cartItems.length > 0 && <RecommendedProducts />} */}

            {/* Coupon Section */}
            {cartItems.length > 0 && (
              <CouponSection
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                appliedCoupon={appliedCoupon}
                isApplying={isApplyingCoupon}
              />
            )}

            {/* Tip Section */}
            {cartItems.length > 0 && (
              <TipSection
                billAmount={subtotal}
                onTipChange={handleTipChange}
                selectedTip={tip}
              />
            )}

            {/* Bill Details Section */}
            {cartItems.length > 0 && (
              <BillDetails
                cartItems={cartItems}
                tip={tip}
                discount={discount}
                isFreeDelivery={isFreeDelivery}
                deliveryCharge={deliveryFeeAmount}
              />
            )}
          </div>

          {/* Checkout Footer - Fixed */}
          {cartItems.length > 0 && (
            <CheckoutFooter
              total={total}
              orderData={{
                subtotal,
                deliveryFee,
                tip,
                discount,
                total,
                items: cartItems,
                customerName: user?.name,
                customerEmail: user?.email,
              }}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-zinc-900 border-t border-white/10 rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom-5">
            <div>
              <h3 className="text-lg font-semibold text-white">Clear cart?</h3>
              <p className="text-white/60 text-sm mt-1">
                This will remove all {cartItems.length} item
                {cartItems.length !== 1 ? "s" : ""} from your cart. This action
                cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearAllItems}
                disabled={updating}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
