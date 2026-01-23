import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ChevronLeft, CreditCard, Loader, CheckCircle2 } from "lucide-react";
import { createCheckout } from "../../services/api/payment.api";
import { createOrder } from "../../services/api/order.api";
import { formatPrice } from "../../utils/formatPrice";
import toast from "react-hot-toast";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("yoco_card");

  // Get order data from location state or URL params
  const orderData = location.state?.orderData || {
    subtotal: parseFloat(searchParams.get("subtotal")) || 0,
    deliveryFee: parseFloat(searchParams.get("deliveryFee")) || 0,
    tip: parseFloat(searchParams.get("tip")) || 0,
    discount: parseFloat(searchParams.get("discount")) || 0,
    total: parseFloat(searchParams.get("total")) || 0,
    deliveryAddress: location.state?.orderData?.deliveryAddress || null,
    items: location.state?.orderData?.items || [],
  };

  const handleCardPayment = async () => {
    try {
      if (!orderData.deliveryAddress) {
        toast.error("Delivery address is required");
        return;
      }

      // Ensure deliveryAddress has proper GeoJSON format
      const deliveryAddress = orderData.deliveryAddress.location?.coordinates
        ? orderData.deliveryAddress
        : {
            ...orderData.deliveryAddress,
            location: {
              type: "Point",
              coordinates: [
                orderData.deliveryAddress.longitude || 28.0473,
                orderData.deliveryAddress.latitude || -26.2041,
              ],
            },
          };

      console.log("Delivery Address being sent:", deliveryAddress);

      setLoading(true);

      // Send only essential data - backend calculates prices
      const orderPayload = {
        items: orderData.items.map((item) => ({
          product: item.productId?._id || item.productId,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant,
        })),
        deliveryAddress,
        couponCode: orderData.couponCode,
        tip: orderData.tip,
        paymentMethod: "yoco_card",
        paymentStatus: "pending",
      };

      console.log("Order Payload:", orderPayload);

      const orderResponse = await createOrder(orderPayload);
      const orderId = orderResponse.order._id;
      const calculatedTotal = orderResponse.order.total; // Use backend-calculated total

      // Create Yoco checkout session with redirect URLs
      const baseUrl = window.location.origin;
      const checkoutResponse = await createCheckout({
        orderId,
        amount: calculatedTotal, // Use backend total, not frontend
        currency: "ZAR",
        successUrl: `${baseUrl}/payment/success?orderId=${orderId}`,
        cancelUrl: `${baseUrl}/payment`,
        failureUrl: `${baseUrl}/payment/failure?orderId=${orderId}`,
      });

      // Redirect to Yoco checkout page
      if (checkoutResponse.redirectUrl) {
        window.location.href = checkoutResponse.redirectUrl;
      } else {
        throw new Error("No redirect URL received from payment gateway");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (paymentMethod === "yoco_card") {
      handleCardPayment();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Payment</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-4 pb-32">
        {/* Order Summary */}
        <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <h2 className="text-sm font-semibold text-white/80 mb-3">
            Order Summary
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Subtotal</span>
              <span className="font-medium">
                {formatPrice(orderData.subtotal)}
              </span>
            </div>
            {orderData.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Delivery Fee</span>
                <span className="font-medium">
                  {formatPrice(orderData.deliveryFee)}
                </span>
              </div>
            )}
            {orderData.tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Tip</span>
                <span className="font-medium">
                  {formatPrice(orderData.tip)}
                </span>
              </div>
            )}
            {orderData.discount > 0 && (
              <div className="flex justify-between text-sm text-[rgb(49,134,22)]">
                <span>Discount</span>
                <span className="font-medium">
                  -{formatPrice(orderData.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-base font-semibold">Total</span>
              <span className="text-lg font-bold text-[rgb(49,134,22)]">
                {formatPrice(orderData.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-sm font-semibold text-white/80 mb-3">
            Select Payment Method
          </h2>

          <div className="space-y-3">
            {/* Card Payment */}
            <label
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentMethod === "yoco_card"
                  ? "border-[rgb(49,134,22)] bg-[rgb(49,134,22)]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="yoco_card"
                checked={paymentMethod === "yoco_card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3 accent-[rgb(49,134,22)]"
                disabled={loading}
              />
              <CreditCard className="w-5 h-5 mr-3 text-white/60" />
              <div className="flex-1">
                <div className="font-medium text-white">Card Payment</div>
                <div className="text-xs text-white/50">
                  Pay securely with your credit/debit card
                </div>
              </div>
              {paymentMethod === "yoco_card" && (
                <CheckCircle2 className="w-5 h-5 text-[rgb(49,134,22)]" />
              )}
            </label>
          </div>

          {/* Security Note */}
          {paymentMethod === "yoco_card" && (
            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-white/60 text-center">
                🔒 Your payment is secured by Yoco. We never store your card
                details.
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/10 px-3 py-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[rgb(49,134,22)] text-white py-3 rounded-lg font-semibold hover:bg-[rgb(49,134,22)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {paymentMethod === "cash_on_delivery"
                ? "Place Order"
                : `Pay ${formatPrice(orderData.total)}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
