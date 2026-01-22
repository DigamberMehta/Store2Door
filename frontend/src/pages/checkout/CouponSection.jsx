import { useState, useEffect } from "react";
import { X, Tag, Check, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../services/api/client";
import { formatPrice } from "../../utils/formatPrice";

const CouponSection = ({
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  isApplying,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Check if coupon is actually applied (has a code)
  const hasAppliedCoupon = appliedCoupon?.code;

  // Fetch available coupons when expanded
  useEffect(() => {
    if (isExpanded && !hasAppliedCoupon) {
      fetchAvailableCoupons();
    }
  }, [isExpanded, hasAppliedCoupon]);

  const fetchAvailableCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const response = await apiClient.get("/coupons/active");
      // The API returns an array directly, not nested in data.data
      const coupons = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setAvailableCoupons(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setAvailableCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleApply = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const success = await onApplyCoupon(couponCode.trim());
    if (success) {
      setCouponCode("");
      setIsExpanded(false);
    }
  };

  const handleRemove = async () => {
    if (!appliedCoupon?.code) {
      return; // Don't try to remove if no coupon applied
    }
    await onRemoveCoupon();
  };

  const handleCouponSelect = async (code) => {
    if (!code.trim()) {
      toast.error("Please select a coupon code");
      return;
    }

    const success = await onApplyCoupon(code.trim());
    if (success) {
      setCouponCode("");
      setIsExpanded(false);
    }
  };

  return (
    <div className="px-3 py-3">
      <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        {/* Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[rgb(49,134,22)]" />
            <span className="text-xs font-bold text-zinc-400">
              {hasAppliedCoupon ? "COUPON APPLIED" : "HAVE A COUPON?"}
            </span>
          </div>
          {hasAppliedCoupon && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[rgb(49,134,22)]">
                -
                {appliedCoupon.discountAmount > 0
                  ? `R${formatPrice(appliedCoupon.discountAmount)}`
                  : appliedCoupon.discountType === "free_delivery"
                    ? "FREE DELIVERY"
                    : ""}
              </span>
              <Check className="w-4 h-4 text-[rgb(49,134,22)]" />
            </div>
          )}
        </button>

        {/* Applied Coupon Display */}
        {hasAppliedCoupon && (
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between bg-[rgb(49,134,22)]/10 border border-[rgb(49,134,22)]/20 rounded-xl px-3 py-2.5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[rgb(49,134,22)]">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-[10px] text-[rgb(49,134,22)]/60 uppercase">
                    Applied
                  </span>
                </div>
                <p className="text-[10px] text-[rgb(49,134,22)]/80">
                  {appliedCoupon.discountType === "percentage" &&
                    `${appliedCoupon.discountValue}% off`}
                  {appliedCoupon.discountType === "fixed" &&
                    `R${formatPrice(appliedCoupon.discountValue)} off`}
                  {appliedCoupon.discountType === "free_delivery" &&
                    "Free delivery"}
                  {appliedCoupon.discountAmount > 0 &&
                    ` • You save R${formatPrice(appliedCoupon.discountAmount)}`}
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                disabled={isApplying}
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        )}

        {/* Coupon Input - Expanded */}
        {isExpanded && !hasAppliedCoupon && (
          <div className="px-3 pb-3 space-y-3">
            {/* Manual Coupon Input */}
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-1">
                Enter Coupon Code
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleApply()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(49,134,22)]/50 transition-colors uppercase"
                  disabled={isApplying}
                />
                <button
                  onClick={handleApply}
                  disabled={isApplying || !couponCode.trim()}
                  className="bg-[rgb(49,134,22)] hover:bg-[rgb(49,134,22)]/90 disabled:bg-zinc-800 disabled:text-zinc-600 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors active:scale-95 min-w-[70px]"
                >
                  {isApplying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            </div>

            {/* Available Coupons List */}
            {loadingCoupons ? (
              <div className="text-center py-4">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-xs text-zinc-500 mt-2">Loading coupons...</p>
              </div>
            ) : availableCoupons.length > 0 ? (
              <div className="space-y-2">
                <div className="border-t border-white/10 pt-3" />
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-1">
                  Available Offers ({availableCoupons.length})
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {availableCoupons.map((coupon) => (
                    <button
                      key={coupon.code}
                      onClick={() => handleCouponSelect(coupon.code)}
                      disabled={isApplying}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-left transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-[rgb(49,134,22)]">
                          {coupon.code}
                        </span>
                        <span className="text-xs font-bold text-[rgb(49,134,22)] bg-[rgb(49,134,22)]/10 px-2 py-0.5 rounded-lg">
                          {coupon.discountType === "percentage" &&
                            `${coupon.discountValue}% OFF`}
                          {coupon.discountType === "fixed" &&
                            `R${formatPrice(coupon.discountValue)} OFF`}
                          {coupon.discountType === "free_delivery" &&
                            "FREE DELIVERY"}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        {coupon.description}
                      </p>
                      {coupon.minOrderValue > 0 && (
                        <p className="text-[9px] text-zinc-500 mt-1.5">
                          Min order: R{formatPrice(coupon.minOrderValue)}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border-t border-white/10 pt-3" />
                <p className="text-xs text-zinc-500 text-center py-4">
                  No coupons available at the moment
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponSection;
