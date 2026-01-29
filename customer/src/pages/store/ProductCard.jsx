import { Star, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/formatPrice";

const ProductCard = ({
  product,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(
      `/product/${product._id || product.id}/${
        product.slug || product.name.toLowerCase().replace(/\s+/g, "-")
      }`,
    );
  };

  const isInCart = cartItems.has(product._id || product.id);
  const cartItem = isInCart ? cartItems.get(product._id || product.id) : null;

  return (
    <div
      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2 relative flex flex-col transition-all duration-200 hover:bg-white/10 hover:border-white/20"
      onClick={handleCardClick}
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
                  i < Math.floor(product.averageRating || product.rating || 0)
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

        {/* Price & Add/Quantity Button */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-white font-bold text-xs">
              R{formatPrice(product.retailPrice || product.price)}
            </div>
            {product.variants && product.variants.length > 0 && (
              <span className="text-[8px] text-green-400 font-medium">
                {product.variants.length} options
              </span>
            )}
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
                    onRemoveFromCart(product, e);
                  } else {
                    onUpdateQuantity(product, cartItem.quantity - 1, e);
                  }
                }}
                className="text-white hover:bg-[rgb(49,134,22)]/80 px-2 py-1 transition-colors shrink-0"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-white text-[10px] font-bold px-1">
                {cartItem.quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(product, cartItem.quantity + 1, e);
                }}
                className="text-white hover:bg-[rgb(49,134,22)]/80 px-2 py-1 transition-colors shrink-0"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              className="w-full py-1 border border-[rgb(49,134,22)] text-[rgb(49,134,22)] rounded-md font-semibold text-[9px] active:bg-[rgb(49,134,22)] active:text-white transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, e);
              }}
            >
              {product.variants && product.variants.length > 0
                ? "SELECT"
                : "ADD"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
