import React from "react";
import { Package } from "lucide-react";

const OrderItems = ({ items = [] }) => {
  const calculateItemTotal = (item) => {
    let total = item.totalPrice || item.unitPrice * item.quantity;

    // Add customizations cost
    if (item.customizations && item.customizations.length > 0) {
      item.customizations.forEach((custom) => {
        total += (custom.additionalCost || 0) * item.quantity;
      });
    }

    return total;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <Package className="w-5 h-5 mr-2" />
        Order Items ({items.length})
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <p className="font-semibold text-gray-900 ml-4">
                  R {calculateItemTotal(item).toFixed(2)}
                </p>
              </div>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  Quantity: {item.quantity} × R {item.unitPrice.toFixed(2)}
                </p>

                {item.selectedVariant && item.selectedVariant.name && (
                  <p>
                    {item.selectedVariant.name}: {item.selectedVariant.value}
                    {item.selectedVariant.priceModifier !== 0 && (
                      <span className="text-green-600 ml-1">
                        (+R {item.selectedVariant.priceModifier.toFixed(2)})
                      </span>
                    )}
                  </p>
                )}

                {item.customizations && item.customizations.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-700">Customizations:</p>
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.customizations.map((custom, idx) => (
                        <li key={idx}>
                          {custom.name}: {custom.value}
                          {custom.additionalCost > 0 && (
                            <span className="text-green-600 ml-1">
                              (+R {custom.additionalCost.toFixed(2)})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.specialInstructions && (
                  <p className="mt-2 italic text-gray-500">
                    Note: {item.specialInstructions}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItems;
