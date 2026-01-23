import { useState, useEffect } from "react";
import { X, CreditCard, Loader } from "lucide-react";
import { createYocoPopup } from "../../utils/yoco";
import { createPayment, confirmPayment } from "../../services/api/payment.api";
import { formatPrice } from "../../utils/formatPrice";
import toast from "react-hot-toast";

const PaymentModal = ({ isOpen, onClose, orderData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("yoco_card");

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  const handleCardPayment = async () => {
    try {
      setLoading(true);

      // Show Yoco payment popup
      const result = await createYocoPopup(orderData.total, "ZAR", {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
      });

      // Create payment with token
      const paymentResponse = await createPayment({
        orderId: orderData.orderId,
        amount: orderData.total,
        currency: "ZAR",
        token: result.id,
        metadata: {
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          items: orderData.items,
        },
      });

      // Confirm payment status
      const confirmResponse = await confirmPayment(
        paymentResponse.data.payment._id,
      );

      if (confirmResponse.data.payment.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess(paymentResponse.data);
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async () => {
    try {
      setLoading(true);

      // For cash on delivery, just notify parent to create order
      onSuccess({
        paymentMethod: "cash_on_delivery",
        orderData,
      });

      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("COD error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (paymentMethod === "yoco_card") {
      handleCardPayment();
    } else if (paymentMethod === "cash_on_delivery") {
      handleCashOnDelivery();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Payment</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {formatPrice(orderData.subtotal)}
              </span>
            </div>
            {orderData.deliveryFee > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {formatPrice(orderData.deliveryFee)}
                </span>
              </div>
            )}
            {orderData.tip > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tip</span>
                <span className="font-medium">
                  {formatPrice(orderData.tip)}
                </span>
              </div>
            )}
            {orderData.discount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Discount</span>
                <span className="font-medium">
                  -{formatPrice(orderData.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(orderData.total)}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6 space-y-3">
              {/* Card Payment */}
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "yoco_card"
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="yoco_card"
                  checked={paymentMethod === "yoco_card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                  disabled={loading}
                />
                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium">Card Payment</div>
                  <div className="text-sm text-gray-500">
                    Pay securely with your card
                  </div>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "cash_on_delivery"
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                  disabled={loading}
                />
                <div className="w-5 h-5 mr-2 flex items-center justify-center text-gray-600 font-bold">
                  💵
                </div>
                <div className="flex-1">
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-gray-500">
                    Pay when you receive your order
                  </div>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
          </form>

          {/* Security Note */}
          {paymentMethod === "yoco_card" && (
            <p className="mt-4 text-xs text-gray-500 text-center">
              🔒 Your payment is secured by Yoco. We never store your card
              details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
