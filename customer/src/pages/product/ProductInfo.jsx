import { MdStar } from "react-icons/md";
import { Clock, ShieldCheck, Package } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

const ProductInfo = ({
  product,
  currentPrice,
  originalPrice,
  avgRating,
  totalReviews,
  selectedVariant,
  setSelectedVariant,
}) => {
  return (
    <>
      {/* Product Image */}
      <div className="w-full px-3 pt-2">
        <div className="w-full bg-white/5 p-6 flex items-center justify-center rounded-2xl border border-white/5 overflow-hidden">
          <img
            src={product.images?.[0]?.url || "https://via.placeholder.com/400"}
            alt={product.name}
            className="w-full max-w-xs h-60 object-contain"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="px-3 pt-3 space-y-3">
        {/* Quick Info Badges */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {product.preparationTime && (
            <div className="flex-shrink-0 flex items-center gap-1.5 bg-white/5 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/5">
              <Clock className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-white/80 font-medium">
                {product.preparationTime} mins
              </span>
            </div>
          )}
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-white/5 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-[rgb(49,134,22)]" />
            <span className="text-xs text-white/80 font-medium">
              Quality Assured
            </span>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-white/5 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/5">
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-white/80 font-medium">
              Safe Packaging
            </span>
          </div>
        </div>

        {/* Name and Basic Details */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="text-lg font-bold text-white leading-tight flex-1">
              {product.name}
            </h1>
          </div>

          {product.specifications?.brand && (
            <p className="text-white/50 text-xs mb-2">
              by {product.specifications.brand}
            </p>
          )}

          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex items-center gap-1 bg-[rgb(49,134,22)]/20 px-2 py-1 rounded-lg border border-[rgb(49,134,22)]/30">
              <MdStar className="text-[rgb(49,134,22)] text-sm" />
              <span className="text-white font-bold text-xs">
                {avgRating.toFixed(1)}
              </span>
            </div>
            <span className="text-white/40 text-xs font-medium">
              {totalReviews} ratings
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black text-white">
              R{currentPrice}
            </span>
          </div>
        </div>

        {/* Select Unit Section */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-white/50 text-[10px] font-bold tracking-wider uppercase">
              Select Unit
            </h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {product.variants.map((variant, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVariant(index)}
                  className={`flex-shrink-0 min-w-[90px] p-2 rounded-lg border transition-all ${
                    selectedVariant === index
                      ? "bg-[rgb(49,134,22)]/20 border-[rgb(49,134,22)]/50"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold mb-0.5 ${
                      selectedVariant === index ? "text-white" : "text-white/50"
                    }`}
                  >
                    {variant.value}
                  </p>
                  <span
                    className={`font-black text-sm ${
                      selectedVariant === index ? "text-white" : "text-white/70"
                    }`}
                  >
                    R
                    {formatPrice(
                      (product.retailPrice || product.price) +
                        (variant.priceModifier || 0) *
                          (1 + (product.markupPercentage || 20) / 100),
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
          <h2 className="text-white font-semibold text-xs mb-1.5">
            About this product
          </h2>
          <p className="text-white/60 text-xs leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Key Features */}
        {product.specifications?.keyFeatures &&
          product.specifications.keyFeatures.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
              <h2 className="text-white font-semibold text-xs mb-2">
                Key Features
              </h2>
              <div className="space-y-2">
                {product.specifications.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <span className="text-white/80 text-xs font-medium">
                        {feature.key}:{" "}
                      </span>
                      <span className="text-white/60 text-xs">
                        {feature.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Product Details / Specifications */}
        {product.specifications?.customSpecs &&
          product.specifications.customSpecs.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
              <h2 className="text-white font-semibold text-xs mb-2">
                Product Details
              </h2>
              <div className="space-y-2">
                {product.specifications.customSpecs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 py-1"
                  >
                    <span className="text-white/50 text-xs">{spec.name}</span>
                    <span className="text-white/80 text-xs font-medium text-right">
                      {spec.value}
                      {spec.unit ? ` ${spec.unit}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <h2 className="text-white font-semibold text-xs mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Info */}
        {product.nutrition &&
          (product.nutrition.calories != null ||
            product.nutrition.protein != null ||
            product.nutrition.carbohydrates != null ||
            product.nutrition.fat != null) && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
              <h2 className="text-white font-semibold text-xs mb-2">
                Nutrition Information
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {product.nutrition.calories != null && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">
                      Calories
                    </p>
                    <p className="text-white font-bold text-xs">
                      {product.nutrition.calories}
                    </p>
                  </div>
                )}
                {product.nutrition.protein != null && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">
                      Protein
                    </p>
                    <p className="text-white font-bold text-xs">
                      {product.nutrition.protein}g
                    </p>
                  </div>
                )}
                {product.nutrition.carbohydrates != null && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">
                      Carbs
                    </p>
                    <p className="text-white font-bold text-xs">
                      {product.nutrition.carbohydrates}g
                    </p>
                  </div>
                )}
                {product.nutrition.fat != null && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">
                      Fat
                    </p>
                    <p className="text-white font-bold text-xs">
                      {product.nutrition.fat}g
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default ProductInfo;
