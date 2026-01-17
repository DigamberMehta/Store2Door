import { Heart, Star } from "lucide-react";
import { useState } from "react";

const RecommendedProducts = () => {
  const [wishlist, setWishlist] = useState([]);

  const products = [
    {
      id: 1,
      name: "Dove 10 in 1 Deep Repair Treatment Hair Mask",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
      rating: 4.5,
      reviews: 3027,
      price: 215,
    },
    {
      id: 2,
      name: "Love Beauty & Planet Argan oil and Lavender Shampoo",
      image:
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
      rating: 4.3,
      reviews: 852,
      price: 374,
    },
    {
      id: 3,
      name: "Dove Deep Moisture Body Wash",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
      rating: 4.6,
      reviews: 5243,
      price: 374,
    },
    {
      id: 4,
      name: "Pantene Pro-V Advanced Hair Fall Solution Shampoo",
      image:
        "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400",
      rating: 4.4,
      reviews: 1892,
      price: 299,
    },
    {
      id: 5,
      name: "Garnier Fructis Hair Food Banana Conditioner",
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
      rating: 4.2,
      reviews: 1456,
      price: 325,
    },
    {
      id: 6,
      name: "L'Oréal Paris Total Repair 5 Shampoo",
      image:
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
      rating: 4.7,
      reviews: 2890,
      price: 449,
    },
  ];

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product) => {
    console.log("Adding to cart:", product);
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm py-4 px-3 mb-4">
      <h2 className="text-white font-semibold text-sm mb-3">
        You might also like
      </h2>

      {/* Grid Container - 3 items per row */}
      <div className="grid grid-cols-3 gap-2 pb-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2 relative flex flex-col"
          >
            {/* Product Image */}
            <div className="w-full aspect-square bg-white/5 rounded-lg overflow-hidden mb-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col flex-1">
              <h3 className="text-white text-[8px] font-medium line-clamp-2 leading-snug h-6 mb-1">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-0.5 mb-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-1.5 h-1.5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white/40 text-[6px]">
                  ({product.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="mt-auto mb-1">
                <span className="text-white font-bold text-xs">
                  ₹{product.price}
                </span>
              </div>

              {/* Add Button */}
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full py-1 border border-blue-300 text-blue-300 rounded-lg font-semibold text-[8px] hover:bg-blue-300 hover:text-black transition-all duration-300"
              >
                ADD
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* See All Products Banner */}
      <div className="mt-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-3 hover:border-white/20 transition-all cursor-pointer">
        <div className="flex items-center justify-center gap-3">
          {/* Product Images Stack */}
          <div className="flex -space-x-2">
            {products.slice(0, 3).map((product, index) => (
              <div
                key={product.id}
                className="w-8 h-8 rounded-lg overflow-hidden border-2 border-black/40 bg-white/5"
                style={{ zIndex: 3 - index }}
              >
                <img
                  src={product.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* See All Text */}
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">
              See all products
            </span>
            <svg
              className="w-4 h-4 text-white"
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
      </div>
    </div>
  );
};

export default RecommendedProducts;
