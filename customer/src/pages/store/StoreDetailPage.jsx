import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { Info } from "lucide-react";
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
import { useUserLocation } from "../../hooks/useUserLocation";

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
  const searchContext = location.state?.searchContext; // { query, category, productId, highlightProduct }
  const highlightProductRef = useRef(null);
  const { latitude, longitude } = useUserLocation();

  // Log search context for debugging
  useEffect(() => {
    if (searchContext) {
      console.log('🔍 StoreDetailPage - Search Context:', searchContext);
    }
  }, [searchContext]);

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
          // Build params with user location if available
          const params = {};
          if (latitude && longitude) {
            params.userLat = latitude;
            params.userLon = longitude;
          }

          const response = await storeAPI.getById(storeName, params);
          if (response.success && response.data) {
            storeData = response.data;
            setStore(storeData);
          }
        }

        // Fetch products for this store
        if (storeData) {
          let productsResponse;

          // Use context-aware endpoint if we have search context
          if (searchContext?.query || searchContext?.category || searchContext?.categoryId || searchContext?.categoryName) {
            console.log('📡 Calling getByStoreWithContext with:', {
              categoryId: searchContext.categoryId,
              categoryName: searchContext.categoryName
            });
            
            productsResponse = await productAPI.getByStoreWithContext(
              storeData._id || storeData.id,
              {
                query: searchContext.query || "",
                category: searchContext.categoryName || searchContext.category || "",
                categoryId: searchContext.categoryId || "",
                limit: 50,
              },
            );

            // Flatten the prioritized product groups and preserve order
            if (productsResponse.success && productsResponse.data) {
              const { matchingProducts, categoryProducts, otherProducts } =
                productsResponse.data;
              
              console.log('📦 Products from backend:', {
                matching: matchingProducts?.length || 0,
                category: categoryProducts?.length || 0,
                other: otherProducts?.length || 0
              });
              
              // Log first few products to see their categories
              console.log('📦 Category products details:', categoryProducts?.map(p => ({
                name: p.name,
                category: p.category,
                subcategory: p.subcategory,
                categoryId: p.categoryId
              })));
              
              console.log('📦 Other products details:', otherProducts?.map(p => ({
                name: p.name,
                category: p.category,
                subcategory: p.subcategory,
                categoryId: p.categoryId
              })));
              
              // Maintain order: matching first, then category, then others
              setProducts([
                ...matchingProducts,
                ...categoryProducts,
                ...otherProducts,
              ]);
            }
          } else {
            // Normal product fetching without search context
            productsResponse = await productAPI.getByStore(
              storeData._id || storeData.id,
              {
                limit: 50,
              },
            );

            if (productsResponse.success && productsResponse.data) {
              setProducts(productsResponse.data);
            }
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

  // Scroll to highlighted product when search context includes productId
  useEffect(() => {
    if (
      searchContext?.productId &&
      searchContext?.highlightProduct &&
      highlightProductRef.current
    ) {
      setTimeout(() => {
        highlightProductRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 500);
    }
  }, [products, searchContext]);

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
      // Revert to previous state on error
      setCartItems(previousCartItems);
      const errorMessage =
        error.response?.data?.message || "Failed to update quantity";
      toast.error(errorMessage, {
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
      // Revert to previous state on error
      setCartItems(previousCartItems);
      const errorMessage =
        error.response?.data?.message || "Failed to remove from cart";
      toast.error(errorMessage, {
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

    // If product has variants, navigate to product detail page to select variant
    if (product.variants && product.variants.length > 0) {
      navigate(`/product/${product._id}/${product.slug || "product"}`);
      return;
    }

    try {
      await cartAPI.addToCart({
        productId: product._id || product.id,
        storeId: store._id || store.id,
        quantity: 1,
        selectedVariant: null,
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
        // Show the actual error message from backend if available
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to add to cart";
        toast.error(errorMessage, {
          duration: 3000,
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
      icon: <Info className="w-4 h-4 text-blue-400" />,
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

  // Group products by subcategory or search context
  const groupedProducts = products.reduce((acc, product, index) => {
    // When we have category context, group products but maintain order
    if (searchContext?.categoryId || searchContext?.category || searchContext?.categoryName) {
      const subcategory = product.subcategory || product.category || "Other";
      
      // Add index to maintain original order within groups
      if (!acc[subcategory]) {
        acc[subcategory] = [];
      }
      acc[subcategory].push({ ...product, _orderIndex: index });
      return acc;
    }
    
    // When search context exists with highlighted product, prioritize it
    if (searchContext?.productId && searchContext?.highlightProduct) {
      const isHighlightedProduct =
        product._id === searchContext.productId ||
        product.id === searchContext.productId;

      if (isHighlightedProduct) {
        // Put highlighted product at top
        if (!acc["Searched Product"]) {
          acc["Searched Product"] = [];
        }
        acc["Searched Product"].push(product);
      } else if (searchContext.query) {
        // Check if product matches search query
        const query = searchContext.query.toLowerCase();
        const matchesQuery =
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(query));

        if (matchesQuery) {
          if (!acc[`Similar Products`]) {
            acc[`Similar Products`] = [];
          }
          acc[`Similar Products`].push(product);
        } else {
          // Other products
          const subcategory =
            product.subcategory || product.category || "Other";
          if (!acc[subcategory]) {
            acc[subcategory] = [];
          }
          acc[subcategory].push(product);
        }
      } else {
        // Normal grouping by subcategory
        const subcategory = product.subcategory || product.category || "Other";
        if (!acc[subcategory]) {
          acc[subcategory] = [];
        }
        acc[subcategory].push(product);
      }
    } else if (searchContext?.query) {
      // When search context exists without specific product, group by priority
      let section = "Other Products";

      // Check if product name/description contains search query
      const query = searchContext.query.toLowerCase();
      const matchesQuery =
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(query));

      if (matchesQuery) {
        section = `Matching "${searchContext.query}"`;
      } else if (
        searchContext.category &&
        (product.category === searchContext.category ||
          product.subcategory === searchContext.category)
      ) {
        section = `Similar Products`;
      }

      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(product);
    } else if (searchContext?.category) {
      // When we have only category context (no query), still group normally but sorting will handle priority
      const subcategory = product.subcategory || product.category || "Other";
      if (!acc[subcategory]) {
        acc[subcategory] = [];
      }
      acc[subcategory].push(product);
    } else {
      // Normal grouping by subcategory
      const subcategory = product.subcategory || "Other";
      if (!acc[subcategory]) {
        acc[subcategory] = [];
      }
      acc[subcategory].push(product);
    }
    return acc;
  }, {});

  // Get subcategories sorted - put search matches first, then the one user came from
  const subcategories = Object.keys(groupedProducts).sort((a, b) => {
    // When we have category context, sort by the minimum order index (earliest appearance)
    if (searchContext?.categoryId || searchContext?.category || searchContext?.categoryName) {
      const aMinIndex = Math.min(...groupedProducts[a].map(p => p._orderIndex ?? 999999));
      const bMinIndex = Math.min(...groupedProducts[b].map(p => p._orderIndex ?? 999999));
      
      // Lower index = earlier in prioritized list = should appear first
      if (aMinIndex !== bMinIndex) {
        return aMinIndex - bMinIndex;
      }
    }
    
    // When search context exists with highlighted product, show it first
    if (searchContext?.productId && searchContext?.highlightProduct) {
      if (a === "Searched Product") return -1;
      if (b === "Searched Product") return 1;
      if (a === "Similar Products") return -1;
      if (b === "Similar Products") return 1;
    } else if (searchContext?.query) {
      // When search context exists, prioritize match sections
      if (a.startsWith("Matching")) return -1;
      if (b.startsWith("Matching")) return 1;
      if (a === "Similar Products") return -1;
      if (b === "Similar Products") return 1;
    }

    // Normal subcategory sorting
    if (fromSubcategory) {
      if (a === fromSubcategory) return -1;
      if (b === fromSubcategory) return 1;
    }
    return a.localeCompare(b);
  });

  console.log(`📋 Final subcategory order:`, subcategories);

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

      {/* Search Context Indicator */}
      {/* {searchContext?.query && (
        <div className="mx-4 mt-4 mb-2 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span className="text-[11px] text-blue-300/80 font-medium">
              {searchContext.highlightProduct
                ? `Product from search: '${searchContext.query}'`
                : `Results for '${searchContext.query}'`}
            </span>
          </div>
        </div>
      )} */}

      {/* Products Section */}
      <ProductsGrid
        subcategories={subcategories}
        groupedProducts={groupedProducts}
        fromSubcategory={fromSubcategory}
        searchContext={searchContext}
        highlightProductRef={highlightProductRef}
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
