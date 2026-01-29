const PricingSection = ({ formData, handleInputChange }) => {
  return (
    <section className="bg-white border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
        <p className="text-sm text-gray-500 mt-1">
          Set your wholesale price (platform markup will be applied
          automatically for customers)
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Wholesale Price (ZAR) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            This is your price. Customers will see this with platform markup
            applied.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Original Price (for sales)
          </label>
          <input
            type="number"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
