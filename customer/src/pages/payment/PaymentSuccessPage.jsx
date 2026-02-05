import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader, ShoppingBag } from "lucide-react";
import { getPayment } from "../../services/api/payment.api";
import { formatPrice } from "../../utils/formatPrice";
import toast from "react-hot-toast";
import Logo from "../../assets/logo.png";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get("paymentId");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId) {
        navigate("/orders");
        return;
      }

      try {
        // Payment is already verified by Paystack before redirect to this page
        // Just fetch the payment details
        const response = await getPayment(paymentId);
        setPayment(response.payment || response.data?.payment);

        // Trigger cart update event to clear cart in UI
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        // Show success toast
        toast.success("Payment confirmed successfully!");
      } catch (error) {
        console.error("Failed to fetch payment details:", error);
        toast.error("Failed to load payment status");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[rgb(49,134,22)]/30 border-t-[rgb(49,134,22)] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={Logo}
              alt="Loading"
              className="w-8 h-8 object-contain opacity-50"
            />
          </div>
        </div>
        <p className="text-white/60 mt-6 font-medium tracking-wide animate-pulse">
          Loading Payment Details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[rgb(49,134,22)]/20 to-transparent opacity-50"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[rgb(49,134,22)]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[rgb(49,134,22)]/10 rounded-full blur-3xl"></div>

          <div className="p-8 relative z-10 text-center">
            {/* Success Animation */}
            <div className="mb-8 relative inline-block">
              <div className="relative z-10">
                <div className="w-24 h-24 bg-zinc-950 rounded-full flex items-center justify-center mx-auto border-4 border-zinc-800 shadow-xl">
                  <img
                    src={Logo}
                    alt="Store2Door"
                    className="w-14 h-14 object-contain"
                  />
                </div>
              </div>
              {/* Pulsing Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute inset-0 rounded-full border-2 border-[rgb(49,134,22)] animate-[ping_1.5s_ease-in-out_infinite] opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-2 border-[rgb(49,134,22)] animate-[ping_1.5s_ease-in-out_infinite_0.5s] opacity-20"></div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Order Confirmed!
            </h1>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Hurray! Your order has been successfully placed. Sit back and
              relax while we prepare your delivery.
            </p>

            {/* Payment Summary */}
            {payment && (
              <div className="bg-white/5 rounded-2xl p-5 mb-8 border border-white/5">
                <div className="flex flex-col gap-1">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                    Total Paid
                  </p>
                  <p className="text-3xl font-bold text-[rgb(49,134,22)]">
                    {formatPrice(payment.amount)}
                  </p>
                  <div className="h-px w-16 bg-white/10 mx-auto my-3"></div>
                  <p className="text-zinc-400 text-xs">
                    Order #
                    {payment.orderId?._id?.slice(-8).toUpperCase() ||
                      orderId?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() =>
                  navigate(`/orders/${orderId || payment?.orderId?._id}/track`)
                }
                className="w-full bg-[rgb(49,134,22)] hover:bg-[rgb(42,118,19)] text-white py-4 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-[0.98] shadow-lg shadow-[rgb(49,134,22)]/25 flex items-center justify-center gap-2 group"
              >
                <span>Track Your Order</span>
                <ShoppingBag className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-xl font-semibold text-sm transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8">
          A confirmation email has been sent to your registered email.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
