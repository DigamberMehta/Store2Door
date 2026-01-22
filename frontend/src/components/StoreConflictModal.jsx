import { X, ShoppingBag, AlertTriangle } from "lucide-react";

const StoreConflictModal = ({
  isOpen,
  onClose,
  currentStoreName,
  newStoreName,
  onKeepCurrent,
  onReplaceCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-b border-white/10 px-6 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Replace cart items?
              </h3>
              <p className="text-xs text-white/60">Different store detected</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-white/80 leading-relaxed">
            Your cart contains items from{" "}
            <span className="font-semibold text-[rgb(49,134,22)]">
              {currentStoreName}
            </span>
            . You can only order from one store at a time.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <ShoppingBag className="w-4 h-4" />
              <span>What would you like to do?</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* Keep Current Cart */}
            <button
              onClick={onKeepCurrent}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white px-4 py-3 rounded-xl font-medium transition-all active:scale-[0.98] text-sm"
            >
              Keep items from {currentStoreName}
            </button>

            {/* Replace Cart */}
            <button
              onClick={onReplaceCart}
              className="w-full bg-[rgb(49,134,22)] hover:bg-[rgb(49,134,22)]/90 text-white px-4 py-3 rounded-xl font-bold transition-all active:scale-[0.98] text-sm shadow-lg shadow-[rgb(49,134,22)]/20"
            >
              Remove current & add from {newStoreName}
            </button>
          </div>

          <p className="text-[10px] text-white/40 text-center pt-2">
            You can always come back and order from {currentStoreName} later
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreConflictModal;
