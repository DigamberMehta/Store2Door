import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ChevronLeft, CreditCard, Loader, CheckCircle2 } from "lucide-react";
import { initializePaystackPayment } from "../../services/api/payment.api";
import { createOrder } from "../../services/api/order.api";
import { formatPrice } from "../../utils/formatPrice";
import { showError } from "../../utils/toast";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paystack_card");
  const [paymentInitiated, setPaymentInitiated] = useState(false);

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

  // Auto-trigger payment when page loads
  useEffect(() => {
    if (
      !paymentInitiated &&
      orderData.deliveryAddress &&
      orderData.items.length > 0
    ) {
      setPaymentInitiated(true);
      handlePaystackPayment();
    }
  }, []);

  const handlePaystackPayment = async () => {
    try {
      if (!orderData.deliveryAddress) {
        showError("Delivery address is required");
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
        paymentMethod: "paystack_card",
        paymentStatus: "pending",
      };

      const orderResponse = await createOrder(orderPayload);
      const orderId = orderResponse.order._id;
      const calculatedTotal = orderResponse.order.total;

      // Initialize Paystack payment
      const baseUrl = window.location.origin;
      const paystackResponse = await initializePaystackPayment({
        orderId,
        amount: calculatedTotal,
        currency: "ZAR",
        callbackUrl: `${baseUrl}/payment/verify`,
      });

      // Redirect to Paystack payment page
      if (paystackResponse.authorization_url) {
        window.location.href = paystackResponse.authorization_url;
      } else {
        throw new Error("No authorization URL received from Paystack");
      }
    } catch (error) {
      console.error("Paystack payment error:", error);
      showError(error, "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Directly trigger Paystack payment
    handlePaystackPayment();
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

        {/* Payment Button */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[rgb(49,134,22)] text-white py-4 rounded-xl font-semibold hover:bg-[rgb(49,134,22)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay {formatPrice(orderData.total)}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
