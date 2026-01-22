import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineSearch } from "react-icons/hi";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import { storeAPI, productAPI, categoryAPI } from "../../services/api";
import cartAPI from "../../services/api/cart.api";
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
  const [cartItems, setCartItems] = useState(new Set());
  const fromSubcategory = location.state?.fromSubcategory;

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await cartAPI.getCart();
      const cart = response?.data || response;
      const productIds = new Set(
        cart?.items?.map((item) => item.productId?._id || item.productId) || [],
      );
      setCartItems(productIds);
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
        toast.error(error.response.data.message, {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(239,68,68,0.3)",
          },
        });
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

      {/* Store Banner & Info Section */}
      <div className="px-2 pt-2">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Store Image */}
          <div className="w-full h-44 relative">
            <img
              src={
                store.coverImage ||
                store.image ||
                "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80"
              }
              alt={store.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          {/* Store Info */}
          <div className="p-4 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-2">
                <h1 className="text-xl font-black text-white leading-tight mb-1">
                  {store.name}
                </h1>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[12px] font-medium">
                  <span>{store.deliveryTime || "25-30 mins"}</span>
                  <span className="opacity-30">|</span>
                  <span className="truncate">
                    {store.location || "Local Area"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-0.5 bg-[rgb(49,134,22)] px-2 py-0.5 rounded-lg text-white text-[11px] font-bold shadow-lg">
                  <span>
                    {store.stats?.averageRating || store.rating || "4.5"}
                  </span>
                  <Star className="w-3 h-3 fill-blue-950" />
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                  {store.stats?.totalReviews || store.reviewCount || "1K+"}{" "}
                  ratings
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-2 pt-4">
        <div
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
          onClick={() => navigate(`/store/${storeName}/search`)}
        >
          <HiOutlineSearch className="text-zinc-500 text-lg flex-shrink-0 transition-colors" />
          <div className="text-[13px] text-zinc-500 w-full transition-colors">
            Search for product
          </div>
        </div>
      </div>

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
      <div className="px-2 pt-4 pb-6">
        {subcategories.length === 0 ? (
          <div className="text-center py-12 px-4">
            <HiOutlineSearch className="text-5xl text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No products found</p>
            <p className="text-zinc-600 text-xs mt-1">
              This store doesn't have any products yet
            </p>
          </div>
        ) : (
          subcategories.map((subcategory) => (
            <div key={subcategory} id={`section-${subcategory}`} className="mb-6 scroll-mt-32">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-black text-white">
                  {subcategory}
                  {fromSubcategory === subcategory && (
                    <span className="ml-2 text-[10px] text-[rgb(49,134,22)] font-normal">
                      • From your search
                    </span>
                  )}
                </h2>
                <p className="text-[10px] text-zinc-500">
                  {groupedProducts[subcategory].length} items
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {groupedProducts[subcategory].map((product) => (
                  <div
                    key={product._id || product.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2 relative flex flex-col transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-95"
                    onClick={() =>
                      navigate(
                        `/product/${product._id || product.id}/${
                          product.slug ||
                          product.name.toLowerCase().replace(/\s+/g, "-")
                        }`,
                      )
                    }
                  >
                    {/* Product Image */}
                    <div className="w-full aspect-square bg-white/5 rounded-lg overflow-hidden mb-2">
                      <img
                        src={
                          product.images?.[0]?.url ||
                          product.image ||
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-1">
                      <h3 className="text-white text-[9px] font-medium line-clamp-2 leading-snug mb-0.5">
                        {product.name}
                      </h3>

                      <div className="text-[8px] text-zinc-500 mb-1">
                        {product.unit || product.weight}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-0.5 mb-1.5">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2 h-2 ${
                                i <
                                Math.floor(
                                  product.averageRating || product.rating || 0,
                                )
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-white/20"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-white/40 text-[8px]">
                          ({product.totalReviews || product.reviewCount || 0})
                        </span>
                      </div>

                      {/* Price & Add Button */}
                      <div className="mt-auto">
                        <div className="text-white font-bold text-xs mb-1.5">
                          R{product.price}
                        </div>
                        <button
                          className={`w-full py-1 border rounded-md font-semibold text-[9px] transition-all ${
                            cartItems.has(product._id || product.id)
                              ? "bg-[rgb(49,134,22)] border-[rgb(49,134,22)] text-white"
                              : "border-[rgb(49,134,22)] text-[rgb(49,134,22)] active:bg-[rgb(49,134,22)] active:text-white"
                          }`}
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          {cartItems.has(product._id || product.id)
                            ? "ADDED"
                            : "ADD"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StoreDetailPage;
