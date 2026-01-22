import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";
import { Loader2 } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

const AddToCartBar = ({
  quantity,
  currentPrice,
  addingToCart,
  isAvailable,
  onQuantityChange,
  onAddToCart,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/5 p-3">
      <div className="flex items-center gap-2.5">
        {/* Quantity Selector */}
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl px-2.5 py-2 border border-white/10">
          <button
            onClick={() => onQuantityChange("decrement")}
            className="p-0.5 active:bg-white/10 rounded transition-all"
            disabled={quantity <= 1}
          >
            <HiOutlineMinus className="w-4 h-4 text-white" />
          </button>
          <span className="text-white font-bold text-sm min-w-[20px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange("increment")}
            className="p-0.5 active:bg-white/10 rounded transition-all"
          >
            <HiOutlinePlus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          disabled={addingToCart || !isAvailable}
          className="flex-1 bg-gradient-to-r from-[rgb(49,134,22)] to-[rgb(49,134,22)]/80 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {addingToCart ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>Add • R{formatPrice(currentPrice * quantity)}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddToCartBar;
