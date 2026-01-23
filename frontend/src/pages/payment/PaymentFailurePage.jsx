import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, AlertCircle, RefreshCw } from "lucide-react";

const PaymentFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorMessage = searchParams.get("error") || "Payment failed";
  const orderId = searchParams.get("orderId");

  const handleRetry = () => {
    if (orderId) {
      navigate(`/checkout?orderId=${orderId}`);
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Failure Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
          <p className="text-white/60 mb-8">
            We couldn't process your payment. Please try again.
          </p>

          {/* Error Details */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-left flex-1">
                <h3 className="font-semibold text-white mb-1">Error Details</h3>
                <p className="text-sm text-white/70">{errorMessage}</p>
              </div>
            </div>
          </div>

          {/* Common Reasons */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-white mb-3">
              Common reasons for payment failure:
            </h3>
            <ul className="text-sm text-white/60 space-y-2">
              <li>• Insufficient funds in your account</li>
              <li>• Incorrect card details entered</li>
              <li>• Card expired or blocked</li>
              <li>• Transaction limit exceeded</li>
              <li>• Network or connectivity issues</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Return to Cart
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full text-gray-600 py-3 rounded-lg font-medium hover:text-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          If you continue to experience issues, please contact our support team
          at{" "}
          <a
            href="mailto:support@store2door.com"
            className="text-blue-400 hover:underline"
          >
            support@store2door.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
