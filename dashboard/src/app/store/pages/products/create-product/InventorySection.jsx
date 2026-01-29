const InventorySection = ({ inventory, handleNestedChange }) => {
  return (
    <section className="bg-white border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage stock levels and product identifiers
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={inventory.quantity}
            onChange={(e) =>
              handleNestedChange("inventory", "quantity", e.target.value)
            }
            required
            min="0"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Low Stock Alert
          </label>
          <input
            type="number"
            value={inventory.lowStockThreshold}
            onChange={(e) =>
              handleNestedChange(
                "inventory",
                "lowStockThreshold",
                e.target.value,
              )
            }
            min="0"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input
            type="text"
            value={inventory.sku}
            onChange={(e) =>
              handleNestedChange("inventory", "sku", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Barcode</label>
          <input
            type="text"
            value={inventory.barcode}
            onChange={(e) =>
              handleNestedChange("inventory", "barcode", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </section>
  );
};

export default InventorySection;
