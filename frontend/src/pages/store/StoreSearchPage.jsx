import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineSearch } from "react-icons/hi";
import { Star } from "lucide-react";
import { storesData } from "../homepage/store/storesData";

const StoreSearchPage = () => {
  const { storeName } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get store data
  const store = storesData.find(
    (s) => {
      const slug = s.name.toLowerCase().replace(/\s+/g, "-");
      const param = storeName?.toLowerCase();
      return slug === param || 
             slug.startsWith(param) || 
             s.id.toString() === param;
    }
  );

  useEffect(() => {
    // Try immediate focus as fallback
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Some mobile browsers need a small delay after navigation
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);

  // All products for the store
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

  // Filter products based on search
  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.weight.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!store) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-4">Store not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleAnimationEnd = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black text-white pb-20 animate-slide-up"
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Header with Search */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-2 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 active:bg-white/10 rounded-full transition-all"
          >
            <HiOutlineArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 transition-all duration-200 focus-within:bg-white/10 focus-within:border-white/20">
            <HiOutlineSearch className="text-zinc-500 text-lg flex-shrink-0 transition-colors" />
            <input 
              ref={inputRef}
              type="search" 
              autoFocus
              inputMode="search"
              placeholder={`Search in ${store.name}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] w-full text-zinc-200 placeholder:text-zinc-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-2 pt-4 pb-6">
        <div className="mb-4">
          <h2 className="text-[15px] font-black text-white mb-1">
            {searchQuery ? "Search Results" : "All Products"}
          </h2>
          <p className="text-[10px] text-zinc-500 mb-4">{filteredProducts.length} items available</p>
          
          <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-500">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2 relative flex flex-col transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-95"
                style={{ animationDelay: `${index * 30}ms` }}
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

export default StoreSearchPage;
