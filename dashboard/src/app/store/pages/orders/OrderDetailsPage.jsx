import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  FileText,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getOrderDetails,
  updateOrderStatus,
} from "../../../../services/store/api/ordersApi";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrderDetails(id);
      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.message || "Failed to load order details");
        toast.error(response.message || "Failed to load order details");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      const errorMsg = "Failed to load order details";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    // Show confirmation toast
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p>Change status to "{newStatus.replace("_", " ").toUpperCase()}"?</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                performStatusUpdate(newStatus);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  };

  const performStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await updateOrderStatus(id, newStatus);
      if (response.success) {
        setOrder(response.data);
        toast.dismiss(); // Dismiss confirmation toast before showing success
        toast.success(
          `Order status updated to ${newStatus.replace("_", " ").toUpperCase()}`,
        );
      } else {
        toast.dismiss(); // Dismiss confirmation toast before showing error
        toast.error(response.message || "Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.dismiss(); // Dismiss confirmation toast before showing error
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      placed: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      preparing: "bg-orange-100 text-orange-800",
      ready_for_pickup: "bg-purple-100 text-purple-800",
      picked_up: "bg-indigo-100 text-indigo-800",
      on_the_way: "bg-cyan-100 text-cyan-800",
      delivered: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Get available forward statuses based on current status
  const getAvailableStatuses = (currentStatus) => {
    // Store managers can only control these statuses
    const storeControlledStatuses = [
      "pending",
      "placed",
      "confirmed",
      "preparing",
      "ready_for_pickup",
    ];

    const currentIndex = storeControlledStatuses.indexOf(currentStatus);
    if (currentIndex === -1) return [];

    // Return only statuses that come after the current one and are store-controlled
    return storeControlledStatuses.slice(currentIndex + 1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-ZA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 font-medium">
            {error || "Order not found"}
          </p>
          <button
            onClick={() => navigate("/store/orders")}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/store/orders")}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={fetchOrderDetails}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <div className="px-4">
        {/* Order Summary Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
              >
                {order.status.replace("_", " ").toUpperCase()}
              </span>
              <div className="text-xs text-gray-600">
                <p>
                  <strong>Order Date:</strong> {formatDate(order.createdAt)}
                </p>
                {order.customerId?.name && (
                  <p>
                    <strong>Customer:</strong> {order.customerId.name}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                R{order.total.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-bold text-gray-900">Order Items</h2>
              </div>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                      {item.productId?.images?.length > 0 ? (
                        <img
                          src={
                            item.productId.images.find((img) => img.isPrimary)
                              ?.url || item.productId.images[0]?.url
                          }
                          alt={
                            item.productId.images.find((img) => img.isPrimary)
                              ?.alt || item.name
                          }
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      {item.selectedVariant && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          {item.selectedVariant.name}:{" "}
                          {item.selectedVariant.value}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        R{item.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        R{item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-4 pt-3 border-t border-gray-200 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    R{order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">
                    R{order.deliveryFee.toFixed(2)}
                  </span>
                </div>
                {order.tip > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Tip</span>
                    <span className="text-gray-900">
                      R{order.tip.toFixed(2)}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Discount</span>
                    <span>-R{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">
                    R{order.total.toFixed(2)}
                  </span>
                </div>
                {order.paymentSplit && (
                  <div className="mt-3 pt-3 border-t-2 border-green-200 bg-green-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-green-800">
                          Your Earnings
                        </span>
                        <p className="text-[10px] text-green-600 mt-0.5">
                          Amount you'll receive from this order
                        </p>
                      </div>
                      <span className="text-lg font-bold text-green-700">
                        R{order.paymentSplit.storeAmount.toFixed(2)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <p className="text-[10px] text-green-600 mt-2">
                        * Discount of R{order.discount.toFixed(2)} absorbed by
                        platform
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-600" />
                  <h2 className="text-sm font-bold text-gray-900">Customer</h2>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {order.customerId?.name || "Guest"}
                  </p>
                  {order.customerId?.email && (
                    <p className="text-xs text-gray-600">
                      {order.customerId.email}
                    </p>
                  )}
                  {order.customerId?.phone && (
                    <p className="text-xs text-gray-600">
                      {order.customerId.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Delivery Address
                  </h2>
                </div>
                <div className="text-xs text-gray-700 space-y-0.5">
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}</p>
                  <p>{order.deliveryAddress.province}</p>
                  <p>{order.deliveryAddress.postalCode}</p>
                  {order.deliveryAddress.instructions && (
                    <p className="text-gray-600 mt-2 pt-2 border-t border-gray-100">
                      <strong>Instructions:</strong>{" "}
                      {order.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Special Instructions
                  </h2>
                </div>
                <p className="text-xs text-gray-700">
                  {order.specialInstructions}
                </p>
              </div>
            )}

            {/* Timeline */}
            {order.trackingHistory && order.trackingHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Order Timeline
                  </h2>
                </div>
                <div className="space-y-3">
                  {order.trackingHistory.map((event, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        {index < order.trackingHistory.length - 1 && (
                          <div className="w-0.5 h-6 bg-gray-200 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <p className="text-xs font-medium text-gray-900">
                          {event.status.replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-[11px] text-gray-600">
                          {formatDate(event.updatedAt)}
                        </p>
                        {event.notes && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Status & Actions */}
          <div className="space-y-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-6">
              <h2 className="text-sm font-bold text-gray-900 mb-2">
                Order Status
              </h2>
              <div className="mb-3">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}
                >
                  {order.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Payment Info */}
              <div className="mb-3 p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CreditCard className="w-3 h-3 text-gray-600" />
                  <h3 className="font-medium text-xs text-gray-900">Payment</h3>
                </div>
                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-gray-900">
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  {order.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method</span>
                      <span className="font-medium text-gray-900">
                        {order.paymentMethod.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  )}
                  {order.paymentId && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction</span>
                        <span className="font-mono text-[10px] text-gray-900">
                          #{order.paymentId.paymentNumber}
                        </span>
                      </div>
                      {order.paymentId.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed</span>
                          <span className="text-gray-900">
                            {formatDate(order.paymentId.completedAt)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {order.status !== "delivered" &&
                order.status !== "cancelled" &&
                !["picked_up", "on_the_way"].includes(order.status) && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-600 mb-1.5">
                      Available next steps:
                    </p>

                    {getAvailableStatuses(order.status).map((status) => {
                      const statusConfig = {
                        placed: {
                          label: "Mark as Placed",
                          description: "After payment",
                          color: "bg-blue-600 hover:bg-blue-700",
                        },
                        confirmed: {
                          label: "Confirm Order",
                          description: "Accept order",
                          color: "bg-green-600 hover:bg-green-700",
                        },
                        preparing: {
                          label: "Start Preparing",
                          description: "In kitchen",
                          color: "bg-orange-600 hover:bg-orange-700",
                        },
                        ready_for_pickup: {
                          label: "Ready for Pickup",
                          description: "Awaiting rider",
                          color: "bg-purple-600 hover:bg-purple-700",
                        },
                      };

                      const config = statusConfig[status];
                      if (!config) return null;

                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(status)}
                          disabled={updating}
                          className={`w-full px-2.5 py-1.5 ${config.color} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-medium flex items-center justify-between`}
                        >
                          <span>{config.label}</span>
                          <span className="text-[9px] opacity-75">
                            {config.description}
                          </span>
                        </button>
                      );
                    })}

                    {["placed", "confirmed", "preparing"].includes(
                      order.status,
                    ) && (
                      <>
                        <div className="border-t border-gray-200 my-1.5"></div>
                        <button
                          onClick={() => handleStatusUpdate("cancelled")}
                          disabled={updating}
                          className="w-full px-2.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-medium flex items-center justify-between"
                        >
                          <span>Cancel Order</span>
                          <span className="text-[9px] opacity-75">
                            Refund customer
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}

              {["picked_up", "on_the_way"].includes(order.status) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                  <p className="text-[11px] text-blue-800 font-medium">
                    🚚 Order in delivery
                  </p>
                  <p className="text-[10px] text-blue-600 mt-0.5">
                    This order is now being handled by the delivery team
                  </p>
                </div>
              )}

              {order.status === "delivered" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                  <p className="text-[11px] text-green-800 font-medium">
                    ✅ Order completed
                  </p>
                  <p className="text-[10px] text-green-600 mt-0.5">
                    This order has been successfully delivered
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default OrderDetailsPage;
