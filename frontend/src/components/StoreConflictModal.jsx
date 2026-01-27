import { X } from "lucide-react";

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
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl max-w-sm w-full shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-black text-white mb-1.5">
              Different Store
            </h3>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              Your cart has items from{" "}
              <span className="text-white font-semibold">
                {currentStoreName}
              </span>
              . Replace with items from{" "}
              <span className="text-white font-semibold">{newStoreName}</span>?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Replace Cart - Primary Action */}
            <button
              onClick={onReplaceCart}
              className="w-full bg-[rgb(49,134,22)] hover:bg-[rgb(49,134,22)]/90 text-white px-4 py-3 rounded-xl font-bold transition-all active:scale-[0.98] text-sm"
            >
              Replace Cart
            </button>

            {/* Keep Current Cart - Secondary Action */}
            <button
              onClick={onKeepCurrent}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-xl font-medium transition-all active:scale-[0.98] text-sm"
            >
              Keep Current Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreConflictModal;
