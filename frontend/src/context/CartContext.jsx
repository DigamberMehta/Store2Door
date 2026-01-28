import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import cartAPI from "../services/api/cart.api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.getCart();
      setCart(response?.data || response);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err);
      // Set empty cart on error to prevent undefined states
      setCart({ items: [], subtotal: 0, totalItems: 0, totalQuantity: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (itemData) => {
    try {
      const response = await cartAPI.addToCart(itemData);
      setCart(response?.data || response);
      return response;
    } catch (err) {
      // Don't update cart on error, let the component handle it
      throw err;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      // Optimistic update
      const previousCart = cart;
      const updatedItems = cart.items.map((item) =>
        item._id === itemId ? { ...item, quantity } : item,
      );
      const newSubtotal = updatedItems.reduce(
        (sum, item) =>
          sum + (item.discountedPrice || item.unitPrice || 0) * item.quantity,
        0,
      );
      setCart({
        ...cart,
        items: updatedItems,
        subtotal: newSubtotal,
        totalQuantity: updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      });

      const response = await cartAPI.updateCartItem(itemId, quantity);
      setCart(response?.data || response);
      return response;
    } catch (err) {
      // Revert on error
      await fetchCart();
      throw err;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      // Optimistic update
      const previousCart = cart;
      const updatedItems = cart.items.filter((item) => item._id !== itemId);
      const newSubtotal = updatedItems.reduce(
        (sum, item) =>
          sum + (item.discountedPrice || item.unitPrice || 0) * item.quantity,
        0,
      );
      setCart({
        ...cart,
        items: updatedItems,
        subtotal: newSubtotal,
        totalItems: updatedItems.length,
        totalQuantity: updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      });

      const response = await cartAPI.removeFromCart(itemId);
      setCart(response?.data || response);
      return response;
    } catch (err) {
      // Revert on error
      await fetchCart();
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart({ items: [], subtotal: 0, totalItems: 0, totalQuantity: 0 });
    } catch (err) {
      console.error("Error clearing cart:", err);
      throw err;
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      const response = await cartAPI.applyCoupon(couponCode);
      setCart(response?.data || response);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await cartAPI.removeCoupon();
      setCart(response?.data || response);
      return response;
    } catch (err) {
      throw err;
    }
  };

  // Get cart items as a Map for quick lookup
  const getCartItemsMap = useCallback(() => {
    if (!cart?.items) return new Map();
    return new Map(
      cart.items.map((item) => [
        item.productId?._id || item.productId,
        { itemId: item._id, quantity: item.quantity },
      ]),
    );
  }, [cart]);

  // Initial cart fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartItemsMap,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
