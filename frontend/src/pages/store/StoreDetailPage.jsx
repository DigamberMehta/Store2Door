import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";
import { storeAPI, productAPI } from "../../services/api";
import cartAPI from "../../services/api/cart.api";
import StoreConflictModal from "../../components/StoreConflictModal";
import StoreBanner from "./StoreBanner";
import ProductsGrid from "./ProductsGrid";
import {
  StoreBannerShimmer,
  ProductGridShimmer,
} from "../../components/shimmer";

const StoreDetailPage = () => {
  const { storeName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [store, setStore] = useState(location.state?.store || null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState(new Map());
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [pendingCartItem, setPendingCartItem] = useState(null);
  const fromSubcategory = location.state?.fromSubcategory;

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await cartAPI.getCart();
      const cart = response?.data || response;
      const itemsMap = new Map(
        cart?.items?.map((item) => [
          item.productId?._id || item.productId,
          { itemId: item._id, quantity: item.quantity },
        ]) || [],
      );
      setCartItems(itemsMap);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCartItems();

    // Listen for cart updates
    const handleCartUpdate = () => fetchCartItems();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);

        // Fetch store if not in location state
        let storeData = store;
        if (!storeData) {
          const response = await storeAPI.getById(storeName);
          if (response.success && response.data) {
            storeData = response.data;
            setStore(storeData);
          }
        }

        // Fetch products for this store
        if (storeData) {
          const productsResponse = await productAPI.getByStore(
            storeData._id || storeData.id,
            {
              limit: 50,
            },
          );

          if (productsResponse.success && productsResponse.data) {
            setProducts(productsResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching store data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeName, store]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleUpdateQuantity = async (product, newQuantity, e) => {
    e.stopPropagation();

    if (newQuantity < 1) return;

    const productId = product._id || product.id;
    const cartItem = cartItems.get(productId);
    if (!cartItem) return;

    // Optimistic update - update UI immediately
    const previousCartItems = new Map(cartItems);
    const updatedCartItems = new Map(cartItems);
    updatedCartItems.set(productId, {
      ...cartItem,
      quantity: newQuantity,
    });
    setCartItems(updatedCartItems);

    try {
      await cartAPI.updateCartItem(cartItem.itemId, newQuantity);
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Revert to previous state on error
      setCartItems(previousCartItems);
      toast.error("Failed to update quantity", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid rgba(239,68,68,0.3)",
        },
      });
    }
  };

  const handleRemoveFromCart = async (product, e) => {
    e.stopPropagation();

    const productId = product._id || product.id;
    const cartItem = cartItems.get(productId);
    if (!cartItem) return;

    // Optimistic update - remove from UI immediately
    const previousCartItems = new Map(cartItems);
    const updatedCartItems = new Map(cartItems);
    updatedCartItems.delete(productId);
    setCartItems(updatedCartItems);

    try {
      await cartAPI.removeFromCart(cartItem.itemId);
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      console.error("Error removing from cart:", error);
      // Revert to previous state on error
      setCartItems(previousCartItems);
      toast.error("Failed to remove from cart", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid rgba(239,68,68,0.3)",
        },
      });
    }
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();

    try {
      await cartAPI.addToCart({
        productId: product._id || product.id,
        storeId: store._id || store.id,
        quantity: 1,
      });

      // Trigger cart update
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Show success toast
      toast.success("Added to cart!", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid rgba(49,134,22,0.3)",
        },
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.data?.code === "DIFFERENT_STORE") {
        // Show modal instead of toast
        setConflictData(error.response.data.data);
        setPendingCartItem({
          productId: product._id || product.id,
          storeId: store._id || store.id,
          quantity: 1,
        });
        setShowConflictModal(true);
      } else {
        toast.error("Failed to add to cart", {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(239,68,68,0.3)",
          },
        });
      }
    }
  };

  const handleKeepCurrentCart = () => {
    setShowConflictModal(false);
    setConflictData(null);
    setPendingCartItem(null);
    toast("Kept your current cart items", {
      duration: 2000,
      position: "top-center",
      icon: "ℹ️",
      style: {
        background: "#1a1a1a",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
      },
    });
  };

  const handleReplaceCart = async () => {
    try {
      // Clear the cart first
      await cartAPI.clearCart();

      // Add the new item
      await cartAPI.addToCart(pendingCartItem);

      // Trigger cart update
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      setShowConflictModal(false);
      setConflictData(null);
      setPendingCartItem(null);

      // Refresh cart items
      fetchCartItems();

      toast.success("Added to cart!", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid rgba(49,134,22,0.3)",
        },
      });
    } catch (error) {
      console.error("Error replacing cart:", error);
      toast.error("Failed to update cart. Please try again.", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid rgba(239,68,68,0.3)",
        },
      });
    }
  };

  // Group products by subcategory
  const groupedProducts = products.reduce((acc, product) => {
    const subcategory = product.subcategory || "Other";
    if (!acc[subcategory]) {
      acc[subcategory] = [];
    }
    acc[subcategory].push(product);
    return acc;
  }, {});

  // Get subcategories sorted - put the one user came from first
  const subcategories = Object.keys(groupedProducts).sort((a, b) => {
    if (fromSubcategory) {
      if (a === fromSubcategory) return -1;
      if (b === fromSubcategory) return 1;
    }
    return a.localeCompare(b);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pb-20">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-2 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-1 active:bg-white/10 rounded-full transition-all"
          >
            <HiOutlineArrowLeft className="w-6 h-6 outline-none" />
          </button>
        </div>

        {/* Store Banner Shimmer */}
        <StoreBannerShimmer />

        {/* Search Bar Shimmer */}
        <div className="px-2 pt-4">
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 h-10"></div>
        </div>

        {/* Products Shimmer */}
        <ProductGridShimmer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-4">Store not found</h2>
          <button
            onClick={handleBack}
            className="bg-[rgb(49,134,22)] text-white px-4 py-2 rounded-xl text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-4">Store not found</h2>
          <button
            onClick={handleBack}
            className="bg-[rgb(49,134,22)] text-white px-4 py-2 rounded-xl text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-2 py-3">
        <button
          onClick={handleBack}
          className="p-2 -ml-1 active:bg-white/10 rounded-full transition-all"
        >
          <HiOutlineArrowLeft className="w-6 h-6 outline-none" />
        </button>
      </div>

      {/* Store Banner */}
      <StoreBanner store={store} />

      {/* Subcategory Navigation */}
      {subcategories.length > 0 && (
        <div className="sticky top-[60px] z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3">
          <div className="flex gap-2 overflow-x-auto px-2 scrollbar-none">
            {subcategories.map((subcategory) => (
              <button
                key={subcategory}
                onClick={() => {
                  const element = document.getElementById(`section-${subcategory}`);
                  if (element) {
                    const headerOffset = 120;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth"
                    });
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                  fromSubcategory === subcategory
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      <ProductsGrid
        subcategories={subcategories}
        groupedProducts={groupedProducts}
        fromSubcategory={fromSubcategory}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveFromCart={handleRemoveFromCart}
      />

      {/* Store Conflict Modal */}
      <StoreConflictModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        currentStoreName={conflictData?.currentStoreName}
        newStoreName={conflictData?.newStoreName}
        onKeepCurrent={handleKeepCurrentCart}
        onReplaceCart={handleReplaceCart}
      />
    </div>
  );
};

export default StoreDetailPage;
