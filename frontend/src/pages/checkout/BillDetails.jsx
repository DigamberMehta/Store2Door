const BillDetails = ({ cartItems }) => {
  // Calculate totals
  const itemsTotal = cartItems.reduce(
    (sum, item) =>
      sum + (item.discountedPrice || item.unitPrice || 0) * item.quantity,
    0,
  );

  const deliveryCharge = 30;
  const isFreeDelivery = itemsTotal > 500; // Free delivery above R500

  const handlingCharge = 11;
  const grandTotal =
    itemsTotal + (isFreeDelivery ? 0 : deliveryCharge) + handlingCharge;

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-3 mx-3 mb-3">
      {/* Bill Details Header */}
      <h2 className="text-white font-semibold text-sm mb-3">Bill details</h2>

      {/* Items Total */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <svg
            className="w-3 h-3 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span className="text-white/80 text-xs">Items total</span>
        </div>
        <span className="text-white font-semibold text-sm">R{itemsTotal}</span>
      </div>

      {/* Delivery Charge */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <svg
            className="w-3 h-3 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
          <span className="text-white/80 text-xs">Delivery charge</span>
        </div>
        {isFreeDelivery ? (
          <span className="text-[rgb(49,134,22)] font-bold text-xs">FREE</span>
        ) : (
          <span className="text-white font-semibold text-sm">
            R{deliveryCharge}
          </span>
        )}
      </div>

      {/* Handling Charge */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-3 h-3 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-white/80 text-xs">Handling charge</span>
        </div>
        <span className="text-white font-semibold text-sm">
          R{handlingCharge}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-3" />

      {/* Grand Total */}
      <div className="flex justify-between items-center">
        <span className="text-white font-bold text-base">Grand total</span>
        <span className="text-white font-bold text-lg">R{grandTotal}</span>
      </div>
    </div>
  );
};

export default BillDetails;
