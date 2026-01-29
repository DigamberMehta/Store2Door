const AvailabilityPromotionsSection = ({ formData, handleInputChange }) => {
  return (
    <section className="bg-white border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Availability & Promotions
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="w-4 h-4"
          />
          <span className="text-sm">Product is Active</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleInputChange}
            className="w-4 h-4"
          />
          <span className="text-sm">Available for Purchase</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleInputChange}
            className="w-4 h-4"
          />
          <span className="text-sm">Featured Product</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isOnSale"
            checked={formData.isOnSale}
            onChange={handleInputChange}
            className="w-4 h-4"
          />
          <span className="text-sm">On Sale</span>
        </label>
      </div>

      {formData.isOnSale && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Sale Start Date
            </label>
            <input
              type="date"
              name="saleStartDate"
              value={formData.saleStartDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Sale End Date
            </label>
            <input
              type="date"
              name="saleEndDate"
              value={formData.saleEndDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default AvailabilityPromotionsSection;
