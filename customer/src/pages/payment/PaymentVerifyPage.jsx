import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { verifyPaystackPayment } from "../../services/api/payment.api";
import toast from "react-hot-toast";
import Logo from "../../assets/logo.png";

const PaymentVerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  const reference = searchParams.get("reference");
  const paymentId = searchParams.get("paymentId");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        toast.error("Invalid payment reference");
        navigate("/payment");
        return;
      }

      try {
        setVerifying(true);
        
        // Verify payment with Paystack
        const response = await verifyPaystackPayment(reference, paymentId);

        if (response.success) {
          // Payment successful
          toast.success("Payment verified successfully!");
          
          // Trigger cart update event to clear cart in UI
          window.dispatchEvent(new CustomEvent("cartUpdated"));
          
          // Redirect to success page
          setTimeout(() => {
            navigate(`/payment/success?paymentId=${response.payment.id}&orderId=${orderId || response.order?.id}`);
          }, 1000);
        } else {
          // Payment failed
          setError(response.message || "Payment verification failed");
          toast.error(response.message || "Payment verification failed");
          
          setTimeout(() => {
            navigate(`/payment/failure?orderId=${orderId}&reason=${encodeURIComponent(response.message || "Verification failed")}`);
          }, 2000);
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setError(error.message || "Failed to verify payment");
        toast.error(error.message || "Failed to verify payment");
        
        setTimeout(() => {
          navigate(`/payment/failure?orderId=${orderId}&reason=${encodeURIComponent(error.message || "Verification error")}`);
        }, 2000);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [reference, paymentId, orderId, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative p-8">
          {/* Animated Background */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-500/20 to-transparent opacity-50"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center">
            {/* Logo with Animation */}
            <div className="mb-6 relative inline-block">
              <div className="w-20 h-20 bg-zinc-950 rounded-full flex items-center justify-center mx-auto border-4 border-zinc-800 shadow-xl">
                <img
                  src={Logo}
                  alt="Store2Door"
                  className="w-12 h-12 object-contain"
                />
              </div>
              {/* Pulsing Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20"></div>
              </div>
            </div>

            {verifying ? (
              <>
                {/* Spinner */}
                <div className="relative mx-auto w-16 h-16 mb-6">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  Verifying Payment
                </h2>
                <p className="text-white/60 text-sm">
                  Please wait while we confirm your payment with Paystack...
                </p>
              </>
            ) : error ? (
              <>
                <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Verification Failed
                </h2>
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <p className="text-white/60 text-xs">
                  Redirecting to payment page...
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Payment Verified!
                </h2>
                <p className="text-white/60 text-sm">
                  Redirecting to order confirmation...
                </p>
              </>
            )}
          </div>
        </div>

        {/* Reference Info */}
        {reference && (
          <div className="mt-4 text-center">
            <p className="text-white/40 text-xs">
              Reference: <span className="text-white/60 font-mono">{reference}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerifyPage;
