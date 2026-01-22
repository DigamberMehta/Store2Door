import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import cartAPI from "../../services/api/cart.api";
import toast from "react-hot-toast";

const TipSection = ({ billAmount, onTipChange, selectedTip }) => {
  const [customAmount, setCustomAmount] = useState("");
  const [tipOptions, setTipOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tip options from backend when billAmount changes
  useEffect(() => {
    if (billAmount && billAmount > 0) {
      fetchTipOptions();
    }
  }, [billAmount]);

  const fetchTipOptions = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getTipOptions(billAmount);
      setTipOptions(response.data.tipOptions);
    } catch (error) {
      console.error("Error fetching tip options:", error);
      toast.error("Failed to load tip options");
      setTipOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (amount) => {
    setCustomAmount("");
    onTipChange(amount);
  };

  const handleCustomChange = (value) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 1000) {
      setCustomAmount(value);
      onTipChange(numValue);
    }
  };

  const handleNoTip = () => {
    setCustomAmount("");
    onTipChange(0);
  };

  return (
    <div className="px-3 py-3">
      <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-[rgb(49,134,22)]" />
          <h3 className="text-xs font-bold text-zinc-400">
            ADD TIP FOR DELIVERY PARTNER
          </h3>
        </div>

        {/* Preset Tip Options */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {/* No Tip Button */}
          <button
            onClick={handleNoTip}
            disabled={loading}
            className={`py-2.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${
              selectedTip === 0 && !customAmount
                ? "bg-white/10 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20"
            }`}
          >
            No Tip
          </button>

          {/* Loading State */}
          {loading ? (
            <div className="col-span-3 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          ) : (
            tipOptions.map((option) => (
              <button
                key={option.percentage}
                onClick={() => handlePresetClick(option.amount)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedTip === option.amount && !customAmount
                    ? "bg-[rgb(49,134,22)] border-[rgb(49,134,22)] text-white"
                    : "bg-white/5 border-white/10 text-white hover:border-[rgb(49,134,22)]/50"
                }`}
              >
                <div>{option.label}</div>
                <div className="text-[10px] text-white/60 mt-0.5">
                  R{formatPrice(option.amount)}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase px-1">
            Or Enter Custom Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              R
            </span>
            <input
              type="number"
              placeholder="0"
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              min="0"
              max="1000"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(49,134,22)]/50 transition-colors"
            />
          </div>
          <p className="text-[9px] text-zinc-500 px-1">
            100% of your tip goes to your delivery partner
          </p>
        </div>

        {/* Tip Summary */}
        {selectedTip > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Tip amount</span>
            <span className="text-sm font-bold text-[rgb(49,134,22)]">
              R{formatPrice(selectedTip)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TipSection;
