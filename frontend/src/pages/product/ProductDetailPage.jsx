import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";
import { MdStar } from "react-icons/md";

const ProductDetailPage = () => {
  const { productName } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);

  // Mock product data - replace with actual data fetching
  const product = {
    id: 1,
    name: decodeURIComponent(productName).replace(/-/g, ' '),
    rating: 4.5,
    reviewCount: "2.5K+",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80",
    description: "Premium quality product with best in class features. Fresh and hygienically packed for your convenience.",
    inStock: true,
    variants: [
      { unit: "7.5 g", price: 99, originalPrice: null },
      { unit: "3 x 7.5 g", price: 289, originalPrice: 297 },
      { unit: "4 x 7.5 g", price: 381, originalPrice: 396 }
    ],
    features: [
      "100% Fresh and Pure",
      "No Added Preservatives",
      "Premium Quality",
      "Hygienically Packed"
    ],
    nutritionInfo: {
      calories: "150 kcal",
      protein: "8g",
      carbs: "12g",
      fat: "8g"
    }
  };

  const currentVariant = product.variants[selectedVariant];

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity(prev => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-2 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 active:bg-white/10 rounded-full transition-all"
          >
            <HiOutlineArrowLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => navigate("/search")}
            className="p-2 -mr-2 active:bg-white/10 rounded-full transition-all"
          >
            <HiOutlineSearch className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div className="w-full px-2 pt-3">
        <div className="w-full bg-white/5 p-8 flex items-center justify-center rounded-[32px] border border-white/5 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-w-sm h-72 object-contain"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="px-2 pt-4 space-y-5">
        {/* Name and Basic Details */}
        <div>
          <h1 className="text-lg font-bold text-white mb-1.5 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5 bg-blue-300 px-1 py-0.5 rounded text-blue-950 text-[10px] font-bold">
              <MdStar className="text-[12px]" />
              <span>{product.rating}</span>
            </div>
            <span className="text-zinc-500 text-[10px] font-medium">{product.reviewCount} reviews</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white">₹{currentVariant.price}</span>
            {currentVariant.originalPrice && (
              <>
                <span className="text-xs text-zinc-500 line-through font-medium">₹{currentVariant.originalPrice}</span>
                <span className="bg-green-500/10 text-green-400 px-1 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  {Math.round((1 - currentVariant.price / currentVariant.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Select Unit Section */}
        <div className="space-y-2">
          <h2 className="text-zinc-500 text-[11px] font-bold tracking-wider uppercase px-1">Select Unit</h2>
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 scrollbar-none">
            {product.variants.map((variant, index) => (
              <button
                key={index}
                onClick={() => setSelectedVariant(index)}
                className={`flex-shrink-0 min-w-[100px] p-2.5 rounded-xl border transition-all text-left ${
                  selectedVariant === index 
                    ? "bg-green-600/10 border-green-600" 
                    : "bg-white/5 border-white/10"
                }`}
              >
                <p className={`text-[11px] font-bold mb-0.5 ${selectedVariant === index ? "text-white" : "text-zinc-400"}`}>
                  {variant.unit}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-black text-sm">₹{variant.price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
          <h2 className="text-white font-semibold text-sm mb-2 px-1">About this product</h2>
          <p className="text-zinc-400 text-xs leading-relaxed px-1">{product.description}</p>
        </div>

        {/* Features */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
          <h2 className="text-white font-semibold text-sm mb-2 px-1">Key Features</h2>
          <div className="space-y-1.5 px-1">
            {product.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-400"></div>
                <span className="text-zinc-300 text-xs">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
          <h2 className="text-white font-semibold text-sm mb-2 px-1">Nutrition Information</h2>
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-[11px] text-left">
              <tbody className="divide-y divide-white/5">
                {Object.entries(product.nutritionInfo).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-2 py-1.5 text-zinc-500 capitalize">{key}</td>
                    <td className="px-2 py-1.5 text-white font-medium text-right">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Fixed Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-2 pt-2">
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm rounded-xl px-2 py-1.5 border border-white/10">
            <button
              onClick={() => handleQuantityChange("decrement")}
              className="p-1 active:bg-white/10 rounded transition-all"
              disabled={quantity <= 1}
            >
              <HiOutlineMinus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-bold text-base min-w-[24px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange("increment")}
              className="p-1 active:bg-white/10 rounded transition-all"
            >
              <HiOutlinePlus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg active:scale-95 transition-all">
            Add to Cart • ₹{currentVariant.price * quantity}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
