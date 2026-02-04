import {
  Package,
  Store,
  User,
  Navigation,
  MapPin,
  Phone,
  UserCheck,
  UserX,
} from "lucide-react";

const ActiveOrderCard = ({
  activeOrder,
  getStatusColor,
  onTrackOrder,
  onShowAssignModal,
  onUnassignOrder,
  unassigningOrder,
}) => {
  if (!activeOrder) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-500">No active order</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
          <Package className="w-4 h-4" />
          Active Order
        </h4>
        <div className="flex gap-1">
          {onTrackOrder && (
            <button
              onClick={() => onTrackOrder(activeOrder)}
              className="p-1.5 bg-white hover:bg-green-50 text-green-600 rounded-lg transition-colors shadow-sm border border-green-200"
              title="Track order"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onShowAssignModal}
            className="p-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-lg transition-colors shadow-sm border border-blue-200"
            title="Reassign to another driver"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onUnassignOrder}
            disabled={unassigningOrder}
            className="p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-lg transition-colors shadow-sm border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Unassign order"
          >
            <UserX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg p-2.5 mb-2 shadow-sm">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Order</span>
            <span className="font-mono font-bold text-gray-900">
              {activeOrder.orderNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${getStatusColor(
                activeOrder.status,
              )}`}
            >
              {activeOrder.status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t">
            <span className="text-gray-600">Amount</span>
            <span className="font-bold text-green-600">
              R{activeOrder.total?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Store */}
      {activeOrder.storeId && (
        <div className="bg-white rounded-lg p-2.5 mb-2 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Store className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-gray-900">
              {activeOrder.storeId.name}
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-0.5">
            <div className="flex items-start gap-1">
              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                {activeOrder.storeId.address?.street},{" "}
                {activeOrder.storeId.address?.city}
              </span>
            </div>
            {activeOrder.storeId.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{activeOrder.storeId.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer */}
      {activeOrder.customerId && (
        <div className="bg-white rounded-lg p-2.5 mb-2 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-gray-900">
              {activeOrder.customerId.name}
            </span>
          </div>
          {activeOrder.customerId.phone && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{activeOrder.customerId.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Delivery */}
      {activeOrder.deliveryAddress && (
        <div className="bg-white rounded-lg p-2.5 mb-2 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Navigation className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-semibold text-gray-900">
              Delivery
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {activeOrder.deliveryAddress.street},{" "}
            {activeOrder.deliveryAddress.city}{" "}
            {activeOrder.deliveryAddress.postalCode}
          </div>
        </div>
      )}

      {/* Items */}
      {activeOrder.items && activeOrder.items.length > 0 && (
        <div className="bg-white rounded-lg p-2.5 shadow-sm">
          <div className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center justify-between">
            <span>Items</span>
            <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-bold">
              {activeOrder.items.length}
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {activeOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-700">
                  <span className="font-semibold">{item.quantity}×</span>{" "}
                  {item.name}
                </span>
                <span className="font-semibold text-gray-900">
                  R{(item.totalPrice || item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveOrderCard;
