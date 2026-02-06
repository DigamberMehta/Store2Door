import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  Store,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Truck,
  FileText,
  Edit,
  X,
  Check,
} from "lucide-react";
import { ordersAPI } from "../../../../services/admin/api/orders.api";
import toast from "react-hot-toast";
import OrderStatusBadge from "../../components/orders/detail/OrderStatusBadge";
import OrderTimeline from "../../components/orders/detail/OrderTimeline";
import OrderItems from "../../components/orders/detail/OrderItems";
import OrderPaymentInfo from "../../components/orders/detail/OrderPaymentInfo";
import OrderActions from "../../components/orders/detail/OrderActions";
import AssignRiderModal from "../../components/orders/detail/AssignRiderModal";
import CancelOrderModal from "../../components/orders/detail/CancelOrderModal";
import UpdateStatusModal from "../../components/orders/detail/UpdateStatusModal";
import EditNotesModal from "../../components/orders/detail/EditNotesModal";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignRider, setShowAssignRider] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [showEditNotes, setShowEditNotes] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(id);
      if (response.success) {
        setOrder(response.data.order);
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (statusData) => {
    try {
      const response = await ordersAPI.updateStatus(id, statusData);
      if (response.success) {
        toast.success("Order status updated successfully");
        setShowUpdateStatus(false);
        fetchOrder();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleAssignRider = async (riderData) => {
    try {
      const response = await ordersAPI.assignRider(id, riderData);
      if (response.success) {
        toast.success("Rider assigned successfully");
        setShowAssignRider(false);
        fetchOrder();
      }
    } catch (error) {
      console.error("Error assigning rider:", error);
      toast.error(error.response?.data?.message || "Failed to assign rider");
    }
  };

  const handleCancel = async (cancelData) => {
    try {
      const response = await ordersAPI.cancel(id, cancelData);
      if (response.success) {
        toast.success("Order cancelled successfully");
        setShowCancel(false);
        fetchOrder();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleUpdateNotes = async (notesData) => {
    try {
      const response = await ordersAPI.updateDetails(id, notesData);
      if (response.success) {
        toast.success("Notes updated successfully");
        setShowEditNotes(false);
        fetchOrder();
      }
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error(error.response?.data?.message || "Failed to update notes");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/orders")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleString("en-ZA")}
              </p>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {order.customerId?.profilePhoto ? (
                      <img
                        src={order.customerId.profilePhoto}
                        alt={order.customerId.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.customerId?.name || "N/A"}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      {order.customerId?.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {order.customerId.email}
                        </div>
                      )}
                      {order.customerId?.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {order.customerId.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Store className="w-5 h-5 mr-2" />
                  Store Information
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {order.storeId?.logo ? (
                      <img
                        src={order.storeId.logo}
                        alt={order.storeId.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Store className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.storeId?.name || "N/A"}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      {order.storeId?.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {order.storeId.phone}
                        </div>
                      )}
                      {order.storeId?.address && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {order.storeId.address.street},{" "}
                          {order.storeId.address.city}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                Delivery Address
              </h2>
              <div className="text-sm text-gray-700">
                <p>{order.deliveryAddress.street}</p>
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.province}{" "}
                  {order.deliveryAddress.postalCode}
                </p>
                {order.deliveryAddress.instructions && (
                  <p className="mt-2 text-gray-600 italic">
                    Instructions: {order.deliveryAddress.instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <OrderItems items={order.items} />

            {/* Payment Info */}
            <OrderPaymentInfo order={order} transactions={transactions} />

            {/* Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Notes & Instructions
                </h2>
                <button
                  onClick={() => setShowEditNotes(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                {order.specialInstructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Special Instructions:
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.specialInstructions}
                    </p>
                  </div>
                )}
                {order.internalNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Internal Notes:
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.internalNotes}
                    </p>
                  </div>
                )}
                {!order.specialInstructions && !order.internalNotes && (
                  <p className="text-sm text-gray-500 italic">No notes added</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Timeline & Actions */}
          <div className="space-y-6">
            {/* Actions */}
            <OrderActions
              order={order}
              onUpdateStatus={() => setShowUpdateStatus(true)}
              onAssignRider={() => setShowAssignRider(true)}
              onCancel={() => setShowCancel(true)}
            />

            {/* Timeline */}
            <OrderTimeline trackingHistory={order.trackingHistory} />

            {/* Rider Info */}
            {order.riderId && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <Truck className="w-5 h-5 mr-2" />
                  Delivery Rider
                </h2>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {order.riderId?.profilePhoto ? (
                      <img
                        src={order.riderId.profilePhoto}
                        alt={order.riderId.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.riderId.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.riderId.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUpdateStatus && (
        <UpdateStatusModal
          order={order}
          onClose={() => setShowUpdateStatus(false)}
          onSubmit={handleStatusUpdate}
        />
      )}

      {showAssignRider && (
        <AssignRiderModal
          order={order}
          onClose={() => setShowAssignRider(false)}
          onSubmit={handleAssignRider}
        />
      )}

      {showCancel && (
        <CancelOrderModal
          order={order}
          onClose={() => setShowCancel(false)}
          onSubmit={handleCancel}
        />
      )}

      {showEditNotes && (
        <EditNotesModal
          order={order}
          onClose={() => setShowEditNotes(false)}
          onSubmit={handleUpdateNotes}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
