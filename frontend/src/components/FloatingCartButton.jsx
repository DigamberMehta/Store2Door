import { ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import cartAPI from "../services/api/cart.api";
import { formatPrice } from "../utils/formatPrice";

const FloatingCartButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      const cartData = response?.data || response; // Handle both response formats
      const newItemCount = cartData?.items?.length || 0;
      const oldItemCount = cart?.items?.length || 0;

      setCart(cartData);

      // Show button if cart has items
      if (newItemCount > 0) {
        setIsVisible(true);

        // Trigger animation if cart count increased
        if (newItemCount > oldItemCount) {
          setAnimate(true);
          setTimeout(() => setAnimate(false), 600);
        }
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const itemCount = cart?.items?.length || 0;
  const totalItems =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Hide on checkout page or if not visible
  if (location.pathname === "/checkout" || !isVisible) {
    return null;
  }

  return (
    <button
      onClick={() => navigate("/checkout")}
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 
        bg-black/20 backdrop-blur-xl border border-white/10
        text-white rounded-full shadow-2xl 
        transition-all duration-300 hover:scale-105 active:scale-95
        hover:bg-black/30 hover:border-white/20
        ${animate ? "animate-bounce" : ""}`}
      style={{
        animation: animate ? "cartPulse 0.6s ease-in-out" : "none",
        boxShadow:
          "0 8px 32px rgba(49, 134, 22, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
      }}
    >
      <div className="flex items-center gap-2 px-4 py-2">
        {/* Cart Icon with Badge */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(49,134,22)] to-[rgb(40,110,18)] flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-lg">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </div>

        {/* Cart Info */}
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[10px] font-medium leading-tight text-white/80">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
          <span className="text-sm font-black leading-tight text-[rgb(49,134,22)]">
            R{formatPrice(cart?.subtotal || 0)}
          </span>
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0">
          <svg
            className="w-4 h-4 text-white/60"
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
      </div>

      {/* Ripple effect on add */}
      {animate && (
        <div className="absolute inset-0 rounded-full bg-[rgb(49,134,22)]/20 animate-ping" />
      )}

      {/* Glassmorphism shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
    </button>
  );
};

// Add keyframe animation for cart pulse
const style = document.createElement("style");
style.textContent = `
  @keyframes cartPulse {
    0%, 100% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.15) rotate(-5deg);
    }
    50% {
      transform: scale(1.1);
    }
    75% {
      transform: scale(1.15) rotate(5deg);
    }
  }
`;
document.head.appendChild(style);

export default FloatingCartButton;
