import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Package, Home, Star } from "lucide-react";
import { getOrderById } from "../../services/api/order.api";
import { formatTimeOnly } from "../../utils/date";

const OrderDeliveredPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    // Fetch order if not passed via state
    if (!order) {
      const fetchOrder = async () => {
        try {
          const response = await getOrderById(orderId);
          setOrder(response.data || response);
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }

    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [orderId, order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: [
                  "#10b981",
                  "#3b82f6",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                ][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Success Animation */}
        <div className="text-center mb-8 animate-slideDown">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-green-500/20 backdrop-blur-xl rounded-full mb-6 animate-bounce-slow border border-green-500/30">
            <CheckCircle className="w-20 h-20 text-green-500 animate-checkmark" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Order Delivered! 🎉
          </h1>
          <p className="text-lg text-white/70">
            Your order has been successfully delivered
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-6 mb-6 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-green-500" />
            <div>
              <h2 className="font-semibold text-white">
                Order #{order?.orderNumber || orderId.slice(-6)}
              </h2>
              <p className="text-sm text-white/50">
                Delivered at{" "}
                {order?.deliveredAt
                  ? formatTimeOnly(order.deliveredAt)
                  : "Just now"}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="font-medium text-white/70 mb-3">Items Delivered</h3>
            <div className="space-y-2">
              {order?.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-white/60">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-white font-medium">
                    R{(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">
                  Total Paid
                </span>
                <span className="text-2xl font-bold text-green-500">
                  R{order?.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 animate-fadeIn animation-delay-400">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/15 transition-all"
          >
            <Package className="w-5 h-5" />
            My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-medium transition-all"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-8 animate-fadeIn animation-delay-600">
          <p className="text-white/60">
            Thank you for ordering with{" "}
            <span className="font-semibold text-green-500">Store2Door</span>! 💚
          </p>
        </div>
      </div>

      <style jsx>{`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: fall 3s linear forwards;
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes checkmark {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.6s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-checkmark {
          animation: checkmark 0.6s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default OrderDeliveredPage;
