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
import cartAPI from "../../services/api/cart.api";
import RecommendedProducts from "./RecommendedProducts";
import BillDetails from "./BillDetails";
import CheckoutFooter from "./CheckoutFooter";
import { CheckoutPageShimmer } from "../../components/shimmer";
import "./scrollbar.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  const cartItems = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const deliveryFee = 30;
  const handlingCharge = 11;
  const total = subtotal + deliveryFee + handlingCharge;

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
          <button
            onClick={handleShare}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <Share2 className="w-4 h-4 text-[rgb(49,134,22)]" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <CheckoutPageShimmer />
      ) : (
        <>
          {/* Cart Items */}
          <div className="pb-24">
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
                          </h3>
                          {item.selectedVariant && (
                            <p className="text-[10px] text-white/60 mb-1">
                              {item.selectedVariant.name}:{" "}
                              {item.selectedVariant.value}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-[10px] text-white/40 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <div className="text-base font-bold text-[rgb(49,134,22)]">
                            R{item.discountedPrice || item.unitPrice}
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

            {/* Bill Details Section */}
            {cartItems.length > 0 && <BillDetails cartItems={cartItems} />}
          </div>

          {/* Checkout Footer - Fixed */}
          {cartItems.length > 0 && <CheckoutFooter total={total.toFixed(0)} />}
        </>
      )}
    </div>
  );
};

export default CheckoutPage;
