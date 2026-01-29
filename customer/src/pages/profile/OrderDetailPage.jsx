import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  Phone,
  User,
} from "lucide-react";
import { getOrderById } from "../../services/api/order.api";
import toast from "react-hot-toast";

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await getOrderById(orderId);
      setOrder(response.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
      navigate("/profile/orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-500 bg-yellow-500/10",
      placed: "text-blue-500 bg-blue-500/10",
      confirmed: "text-cyan-500 bg-cyan-500/10",
      preparing: "text-purple-500 bg-purple-500/10",
      ready_for_pickup: "text-indigo-500 bg-indigo-500/10",
      picked_up: "text-orange-500 bg-orange-500/10",
      on_the_way: "text-amber-500 bg-amber-500/10",
      delivered: "text-green-500 bg-green-500/10",
      cancelled: "text-red-500 bg-red-500/10",
    };
    return colors[status] || "text-gray-500 bg-gray-500/10";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      placed: ShoppingBag,
      confirmed: CheckCircle,
      preparing: Package,
      ready_for_pickup: Package,
      picked_up: Truck,
      on_the_way: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  const formatStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return typeof price === "number" ? price.toFixed(2) : "0.00";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-[rgb(49,134,22)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/40 text-sm">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[rgb(49,134,22)]/30 font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button
            onClick={() => navigate("/profile/orders")}
            className="p-1.5 -ml-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">
            Order Details
          </h1>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="px-3 pt-4 pb-4 space-y-3">
        {/* Order Header Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/60 text-[10px] font-medium">
              ORDER #{order._id.slice(-8).toUpperCase()}
            </span>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}
            >
              {getStatusIcon(order.status)}
              <span>{formatStatus(order.status)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-[11px]">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Store Info Card */}
        {order.store && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-4 h-4 text-white/50" />
              <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
                Store
              </span>
            </div>
            <p className="text-white text-sm font-medium">{order.store.name}</p>
          </div>
        )}

        {/* Order Items Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-white/50" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
              Items ({order.items?.length || 0})
            </span>
          </div>

          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0"
              >
                {/* Product Image */}
                {item.productId?.image && (
                  <div className="w-16 h-16 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden">
                    <img
                      src={item.productId.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-xs font-medium line-clamp-2 mb-1">
                    {item.name}
                    {item.selectedVariant && (
                      <span className="text-white/60">
                        {" "}
                        | {item.selectedVariant.value}
                      </span>
                    )}
                  </h3>
                  <p className="text-white/40 text-[10px] mb-1">
                    Qty: {item.quantity}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-[10px]">
                      R{formatPrice(item.unitPrice)} each
                    </span>
                    <span className="text-[rgb(49,134,22)] text-xs font-semibold">
                      R{formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address Card */}
        {order.deliveryAddress && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-white/50" />
              <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
                Delivery Address
              </span>
            </div>
            <p className="text-white text-xs mb-0.5">
              {order.deliveryAddress.street}
            </p>
            <p className="text-white/60 text-[11px]">
              {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
              {order.deliveryAddress.postalCode}
            </p>
          </div>
        )}

        {/* Customer Info Card */}
        {order.customer && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-white/50" />
              <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
                Customer Details
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-white/40 text-[10px] mb-0.5">Name</p>
                <p className="text-white text-xs">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] mb-0.5">Phone</p>
                <p className="text-white text-xs">{order.customer.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-white/50" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
              Payment Summary
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Subtotal</span>
              <span className="text-white">
                R{formatPrice(order.subtotal || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Delivery Fee</span>
              <span className="text-white">
                R{formatPrice(order.deliveryFee || 0)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Discount</span>
                <span className="text-green-500">
                  -R{formatPrice(order.discount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">VAT (15%)</span>
              <span className="text-white">R{formatPrice(order.vat || 0)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Total</span>
              <span className="text-[rgb(49,134,22)] font-bold text-base">
                R{formatPrice(order.total || 0)}
              </span>
            </div>
          </div>

          {order.paymentMethod && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-white/40 text-[10px] mb-1">Payment Method</p>
              <p className="text-white text-xs capitalize">
                {order.paymentMethod}
              </p>
            </div>
          )}
        </div>

        {/* Track Order Button */}
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <button
            onClick={() => navigate(`/profile/orders/${order._id}/track`)}
            className="w-full px-4 py-3 bg-[rgb(49,134,22)] text-white text-sm font-medium rounded-xl active:bg-[rgb(49,134,22)]/80 transition-all"
          >
            Track Order
          </button>
        )}

        {/* Reorder Button for Delivered Orders */}
        {order.status === "delivered" && (
          <button
            onClick={() => {
              toast.success("Reorder functionality coming soon!");
            }}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-xl active:bg-white/10 transition-all"
          >
            Reorder
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
