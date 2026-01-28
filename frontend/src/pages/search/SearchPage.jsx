import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlineArrowLeft,
  HiOutlineMicrophone,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { StoreList } from "../homepage/store";
import { suggestionsAPI } from "../../services/api";
import cartAPI from "../../services/api/cart.api";
import { formatPrice } from "../../utils/formatPrice";
import StoreConflictModal from "../../components/StoreConflictModal";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRef = useRef(null);

  const initialQuery =
    searchParams.get("q") || searchParams.get("category") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [productResults, setProductResults] = useState([]);
  const [storeResults, setStoreResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spellingCorrections, setSpellingCorrections] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [cartItems, setCartItems] = useState(new Map());
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [pendingCartItem, setPendingCartItem] = useState(null);

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
      // Silently fail - cart icon will show 0 items
    }
  };

  useEffect(() => {
    fetchCartItems();

    // Fetch user's saved address from backend
    const fetchUserLocation = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setLocationError("Please login to see accurate distances");
          console.warn("No auth token found - user not logged in");
          return;
        }

        const response = await fetch(
          "http://localhost:3000/api/customer-profile/addresses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const addresses = data.data?.addresses || data.addresses || [];
          if (data.success && addresses.length > 0) {
            // Use the default address or first address
            const defaultAddress =
              addresses.find((addr) => addr.isDefault) || addresses[0];
            if (defaultAddress.latitude && defaultAddress.longitude) {
              setUserLocation({
                lat: defaultAddress.latitude,
                lon: defaultAddress.longitude,
              });

              setLocationError(null);
              return;
            } else {
              setLocationError("Address found but missing coordinates");
            }
          } else {
            setLocationError(
              "No delivery address found. Please add an address.",
            );
          }
        } else {
          setLocationError("Failed to fetch address");
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
        setLocationError("Failed to fetch location");
      }
    };

    fetchUserLocation();

    // Listen for cart updates
    const handleCartUpdate = () => fetchCartItems();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    // Focus the search box on mount if no initial query
    if (inputRef.current && !initialQuery) {
      inputRef.current.focus();
    }
  }, [initialQuery]);

  // Sync state if URL changes
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("category");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Fetch suggestions - both products and stores
  useEffect(() => {
    const fetchResults = async () => {
      const query = searchQuery.trim();
      if (!query || query.length < 2) {
        setProductResults([]);
        setStoreResults([]);
        setSpellingCorrections([]);
        return;
      }

      try {
        setLoading(true);

        // Get both products and stores from suggestions API with user location
        const suggestionsResponse = await suggestionsAPI.getSuggestions(query, {
          limit: 20,
          userLat: userLocation?.lat,
          userLon: userLocation?.lon,
        });

        // Extract corrections if available
        if (suggestionsResponse.suggestions?.corrections) {
          setSpellingCorrections(suggestionsResponse.suggestions.corrections);
        } else {
          setSpellingCorrections([]);
        }

        // Extract products
        if (suggestionsResponse.suggestions?.products) {
          const products = suggestionsResponse.suggestions.products.map(
            (suggestion) => ({
              _id: suggestion.id?.replace("product_", ""),
              name: suggestion.name,
              description: suggestion.description,
              image: suggestion.image,
              price: suggestion.price,
              rating: suggestion.rating || 0,
              category: suggestion.category,
              storeId: suggestion.storeId,
              storeName: suggestion.storeName,
            }),
          );
          setProductResults(products);
        } else {
          setProductResults([]);
        }

        // Extract stores
        if (suggestionsResponse.suggestions?.stores) {
          const stores = suggestionsResponse.suggestions.stores.map(
            (suggestion) => {
              return {
                _id: suggestion.id?.replace("store_", ""),
                name: suggestion.name,
                description: suggestion.description,
                image: suggestion.image,
                rating: suggestion.rating,
                category: suggestion.category,
                distance: suggestion.distance, // Distance from backend
                address: suggestion.address,
              };
            },
          );
          setStoreResults(stores);
        } else {
          setStoreResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, userLocation]);

  // Cart handlers
  const handleAddToCart = async (product, e) => {
    e?.stopPropagation();
    try {
      await cartAPI.addItem({
        productId: product._id,
        quantity: 1,
        storeId: product.storeId,
      });

      await fetchCartItems();
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success(`${product.name} added to cart`, {
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
        // This is not an error - show modal for user to choose
        setConflictData(error.response.data.data);
        setPendingCartItem({
          productId: product._id,
          quantity: 1,
          storeId: product.storeId,
        });
        setShowConflictModal(true);
      } else {
        // Actual error - show message from backend
        const errorMessage =
          error.response?.data?.message || "Failed to add item to cart";
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
    }
  };

  const handleUpdateQuantity = async (product, newQuantity, e) => {
    e?.stopPropagation();
    if (newQuantity < 1) return;

    const cartItem = cartItems.get(product._id);
    if (!cartItem) return;

    try {
      await cartAPI.updateItemQuantity(cartItem.itemId, newQuantity);
      await fetchCartItems();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error updating quantity:", error);
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
    e?.stopPropagation();
    const cartItem = cartItems.get(product._id);
    if (!cartItem) return;

    try {
      await cartAPI.removeItem(cartItem.itemId);
      await fetchCartItems();
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success(`${product.name} removed from cart`, {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid rgba(49,134,22,0.3)",
        },
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item", {
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

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-2 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 active:bg-white/10 rounded-full transition-all"
          >
            <HiOutlineArrowLeft className="w-6 h-6" />
          </button>

          <div className="relative flex-1">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 gap-2 focus-within:bg-white/10 focus-within:border-white/20 transition-all">
              <HiOutlineSearch className="text-lg text-white/50" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for stores or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-white/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Clear
                </button>
              )}
              <HiOutlineMicrophone className="text-xl text-white/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="py-2">
        <AnimatePresence mode="wait">
          {searchQuery.length >= 2 ? (
            <motion.div
              key="search-results"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Spelling Corrections */}
              {spellingCorrections.length > 0 && (
                <div className="mx-2 py-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[11px] text-zinc-500 mb-2">
                    Did you mean?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {spellingCorrections.map((correction, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(correction.suggestion)}
                        className="px-3 py-1.5 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full transition-colors"
                      >
                        {correction.suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : productResults.length > 0 || storeResults.length > 0 ? (
                <div className="pt-2 space-y-6">
                  {/* Product Results */}
                  {productResults.length > 0 && (
                    <div>
                      <div className="px-2 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        Products ({productResults.length})
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 px-2">
                        {productResults.map((product) => {
                          const isInCart = cartItems.has(product._id);
                          const cartItem = isInCart
                            ? cartItems.get(product._id)
                            : null;

                          return (
                            <div
                              key={product._id}
                              className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-1.5 relative flex flex-col transition-all duration-200 hover:bg-white/10 hover:border-white/20"
                            >
                              <div
                                onClick={() => {
                                  // Use storeId for navigation to avoid slug mismatch issues
                                  const identifier =
                                    product.storeId ||
                                    product.storeName
                                      ?.toLowerCase()
                                      .replace(/[^a-z0-9]+/g, "-")
                                      .replace(/(^-|-$)/g, "");

                                  navigate(`/store/${identifier}`, {
                                    state: {
                                      searchContext: {
                                        query: searchQuery,
                                        productId: product._id,
                                        highlightProduct: true,
                                      },
                                    },
                                  });
                                }}
                                className="cursor-pointer"
                              >
                                <div className="w-full aspect-square bg-white/5 rounded-md overflow-hidden mb-1.5">
                                  <img
                                    src={
                                      product.image ||
                                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"
                                    }
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="text-white text-[8px] font-medium line-clamp-2 leading-tight mb-0.5">
                                  {product.name}
                                </h3>
                                <div className="text-[7px] text-zinc-400 mb-0.5 truncate">
                                  {product.storeName}
                                </div>
                              </div>

                              {/* Price & Add/Quantity Button */}
                              <div className="mt-auto">
                                <div className="text-white font-bold text-[10px] mb-1">
                                  R{formatPrice(product.price)}
                                </div>
                                {isInCart ? (
                                  <div
                                    className="flex items-center justify-between bg-[rgb(49,134,22)] border border-[rgb(49,134,22)] rounded-md overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (cartItem.quantity === 1) {
                                          handleRemoveFromCart(product, e);
                                        } else {
                                          handleUpdateQuantity(
                                            product,
                                            cartItem.quantity - 1,
                                            e,
                                          );
                                        }
                                      }}
                                      className="text-white hover:bg-[rgb(49,134,22)]/80 px-1.5 py-0.5 transition-colors shrink-0"
                                    >
                                      <Minus className="w-2.5 h-2.5" />
                                    </button>
                                    <span className="text-white text-[9px] font-bold px-0.5">
                                      {cartItem.quantity}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateQuantity(
                                          product,
                                          cartItem.quantity + 1,
                                          e,
                                        );
                                      }}
                                      className="text-white hover:bg-[rgb(49,134,22)]/80 px-1.5 py-0.5 transition-colors shrink-0"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="w-full py-0.5 border border-[rgb(49,134,22)] text-[rgb(49,134,22)] rounded-md font-semibold text-[8px] active:bg-[rgb(49,134,22)] active:text-white transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(product, e);
                                    }}
                                  >
                                    ADD
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Store Results */}
                  {storeResults.length > 0 && (
                    <div>
                      <div className="px-2 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        Stores ({storeResults.length})
                      </div>
                      <StoreList
                        stores={storeResults}
                        onStoreClick={(store) => {
                          const storeNameSlug = store.name
                            .toLowerCase()
                            .replace(/\s+/g, "-");
                          navigate(`/store/${storeNameSlug}`, {
                            state: {
                              store,
                              searchContext: {
                                query: searchQuery,
                                category: store.category,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 opacity-50 text-sm">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineSearch className="w-8 h-8 text-white/20" />
                  </div>
                  No results found matching "{searchQuery}"
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <HiOutlineSearch className="w-12 h-12 text-white/10" />
              </div>
              <h3 className="text-xl font-semibold text-white/80 mb-2">
                Search store2door
              </h3>
              <p className="text-sm text-white/30 max-w-[240px] leading-relaxed mx-auto">
                Discover local stores, fresh groceries, and the best deals near
                you
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Store Conflict Modal */}
      <StoreConflictModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        currentStoreName={conflictData?.currentStoreName}
        newStoreName={conflictData?.newStoreName}
        onKeepCurrent={() => {
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
        }}
        onReplaceCart={async () => {
          try {
            await cartAPI.clearCart();
            await cartAPI.addItem(pendingCartItem);
            await fetchCartItems();
            window.dispatchEvent(new Event("cartUpdated"));

            setShowConflictModal(false);
            setConflictData(null);
            setPendingCartItem(null);

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
            const errorMessage =
              error.response?.data?.message || "Failed to replace cart";
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
        }}
      />
    </motion.div>
  );
};

export default SearchPage;
