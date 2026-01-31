import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Store,
  Phone,
  MessageSquare,
  Clock,
  ShieldCheck,
  Package,
  PhoneOff,
  BellOff,
  DoorOpen,
  PawPrint,
  Mic,
} from "lucide-react";
import { ordersAPI } from "../../services/api";
import toast from "react-hot-toast";

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await ordersAPI.getOrderById(id);
        setOrder(response?.data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleAcceptOrder = async () => {
    try {
      setAccepting(true);
      await ordersAPI.acceptOrder(id);
      toast.success("Order accepted!");
      navigate(`/tracking/${id}`);
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error(error.response?.data?.message || "Failed to accept order");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Order not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-emerald-400 underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <p className="text-2xl font-bold">Order Details</p>
          <p className="text-xs text-zinc-500 font-mono">{order.orderNumber}</p>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Route Details */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full" />
              <div
                className="w-0.5 flex-1 bg-dashed border-l border-white/20"
                style={{ minHeight: "80px" }}
              />
              <div className="w-3 h-3 bg-emerald-400 rounded-full" />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Store Pickup
                  </p>
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-white/5 rounded-lg text-white">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold mt-1">
                  {order.storeId?.name || "Store"}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {order.storeId?.address?.street},{" "}
                  {order.storeId?.address?.city}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Customer Drop-off
                  </p>
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-white/5 rounded-lg text-white">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 bg-white/5 rounded-lg text-white">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 mt-1">
                  {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">
            Order Items
          </p>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  {item.selectedVariant?.name && (
                    <p className="text-xs text-zinc-500">
                      {item.selectedVariant.name}: {item.selectedVariant.value}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">x{item.quantity}</p>
                  <p className="text-sm font-medium text-white">
                    R{item.totalPrice?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Instructions */}
        {order.deliveryAddress?.instructions && (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">
              Customer Delivery Instructions
            </p>
            <p className="text-xs text-zinc-300">
              {order.deliveryAddress.instructions}
            </p>
          </div>
        )}

        {/* Your Earnings */}
        <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-4">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-4">
            Your Earnings
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Delivery Fee</span>
              <span className="text-white">
                R{order.deliveryFee?.toFixed(2)}
              </span>
            </div>
            {order.tip > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Tip</span>
                <span className="text-emerald-400 font-bold">
                  R{order.tip?.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-white/5 flex justify-between">
              <span className="text-sm font-bold text-white">
                Total Earnings
              </span>
              <span className="text-base font-bold text-emerald-400">
                R{((order.deliveryFee || 0) + (order.tip || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
        {order.status === "ready_for_pickup" || order.status === "confirmed" ? (
          <button
            onClick={handleAcceptOrder}
            disabled={accepting}
            className="w-full bg-emerald-500 py-4 rounded-xl text-sm font-bold text-black active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accepting ? "Accepting..." : "Accept Order"}
          </button>
        ) : (
          <div className="flex gap-3">
            <button className="flex-1 bg-white/10 py-4 rounded-xl text-sm font-bold hover:bg-white/15 transition-colors">
              Direction
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-emerald-500 py-4 rounded-xl text-sm font-bold text-black active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
