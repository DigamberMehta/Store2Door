import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineSearch } from "react-icons/hi";
import { Star } from "lucide-react";
import { storesData } from "../homepage/store/storesData";

const StoreDetailPage = () => {
  const { storeName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(0);

  // Get store from location state or find by store name slug or ID
  const store =
    location.state?.store ||
    storesData.find(
      (s) => {
        const slug = s.name.toLowerCase().replace(/\s+/g, "-");
        const param = storeName?.toLowerCase();
        return slug === param || 
               slug.startsWith(param) || 
               s.id.toString() === param;
      }
    );

  const handleBack = () => {
    navigate(-1);
  };

  if (!store) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-4">Store not found</h2>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Mock categories and products for the store
  const categories = [
    { id: 1, name: "All" },
    { id: 2, name: "Milk" },
    { id: 3, name: "Bread" },
    { id: 4, name: "Snacks" },
    { id: 5, name: "Beverages" },
  ];

  const allProducts = [
    {
      id: 1,
      name: "Amul Gold Full Cream Milk",
      price: 28,
      originalPrice: null,
      weight: "500 ml",
      rating: 4.5,
      reviewCount: "240.4k",
      image: "https://images.unsplash.com/photo-1550583724-12558182c603?w=200&q=80",
      inStock: true,
      boughtEarlier: true,
      category: "Milk"
    },
    {
      id: 2,
      name: "Amul Moti Toned Milk (90 Days Shelf Life)",
      price: 32,
      originalPrice: null,
      weight: "450 ml",
      rating: 4.4,
      reviewCount: "66.9k",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80",
      inStock: true,
      boughtEarlier: true,
      category: "Milk"
    },
    {
      id: 3,
      name: "Verka Standard Toned Milk",
      price: 63,
      originalPrice: null,
      weight: "1 l",
      rating: 4.3,
      reviewCount: "89.3k",
      image: "https://images.unsplash.com/photo-1600788907416-456578634209?w=200&q=80",
      inStock: true,
      boughtEarlier: true,
      category: "Milk"
    },
    {
      id: 4,
      name: "Amul Shakti Milk (Fresh)",
      price: 26,
      originalPrice: null,
      weight: "500 ml",
      rating: 4.4,
      reviewCount: "21 MINS",
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&q=80",
      inStock: true,
      category: "Milk"
    },
    {
      id: 5,
      name: "Verka Double Toned Milk",
      price: 26,
      originalPrice: null,
      weight: "500 ml",
      rating: 4.2,
      reviewCount: "23 MINS",
      image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80",
      inStock: true,
      category: "Milk"
    },
    {
      id: 6,
      name: "Verka Full Cream Milk",
      price: 69,
      originalPrice: null,
      weight: "1 l",
      rating: 4.5,
      reviewCount: "21 MINS",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80",
      inStock: true,
      category: "Milk"
    },
    {
      id: 7,
      name: "Organic Brown Bread",
      price: 45,
      originalPrice: 50,
      weight: "400 g",
      rating: 4.6,
      reviewCount: "5.2k",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80",
      inStock: true,
      category: "Bread"
    },
    {
      id: 8,
      name: "Farm Fresh Eggs",
      price: 90,
      originalPrice: 100,
      weight: "12 pcs",
      rating: 4.7,
      reviewCount: "12.4k",
      image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200&q=80",
      inStock: true,
      category: "Bread"
    }
  ];

  // Filter products based on search query and category
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 0 || 
                           product.category === categories[selectedCategory].name;
    return matchesCategory;
  });

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
              src={store.image || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80"}
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
                  <span className="truncate">{store.location || "Local Area"}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-0.5 bg-blue-300 px-2 py-0.5 rounded-lg text-blue-950 text-[11px] font-bold shadow-lg">
                  <span>{store.rating}</span>
                  <Star className="w-3 h-3 fill-blue-950" />
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                  {store.reviewCount || "1K+"} ratings
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

      {/* Products Section */}
      <div className="px-2 pt-4 pb-6">
        <div className="mb-4">
          <h2 className="text-[15px] font-black text-white mb-1">All Products</h2>
          <p className="text-[10px] text-zinc-500 mb-4">{filteredProducts.length} items available</p>
          
          <div className="grid grid-cols-3 gap-2">{filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2 relative flex flex-col transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-95"
                  onClick={() => navigate(`/product/${product.name.toLowerCase().replace(/\s+/g, "-")}/info`)}
                >
                  {/* Product Image */}
                  <div className="w-full aspect-square bg-white/5 rounded-lg overflow-hidden mb-2">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex flex-col flex-1">
                    <h3 className="text-white text-[9px] font-medium line-clamp-2 leading-snug mb-0.5">
                      {product.name}
                    </h3>
                    
                    <div className="text-[8px] text-zinc-500 mb-1">{product.weight}</div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-0.5 mb-1.5">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2 h-2 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white/40 text-[8px]">
                        ({product.reviewCount})
                      </span>
                    </div>
                    
                    {/* Price & Add Button */}
                    <div className="mt-auto">
                      <div className="text-white font-bold text-xs mb-1.5">₹{product.price}</div>
                      <button 
                        className="w-full py-1 border border-blue-300 text-blue-300 rounded-md font-semibold text-[9px] active:bg-blue-300 active:text-black transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart logic
                        }}
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 px-4">
                <HiOutlineSearch className="text-5xl text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">No products found</p>
                <p className="text-zinc-600 text-xs mt-1">Try searching with different keywords</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default StoreDetailPage;
