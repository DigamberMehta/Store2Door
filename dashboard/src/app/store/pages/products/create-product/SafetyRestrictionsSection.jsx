const SafetyRestrictionsSection = ({ formData, handleInputChange }) => {
  return (
    <section className="bg-white border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Safety & Restrictions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Minimum Age</label>
          <input
            type="number"
            name="minimumAge"
            value={formData.minimumAge}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="e.g., 18 for alcohol"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Preparation Time (min)
          </label>
          <input
            type="number"
            name="preparationTime"
            value={formData.preparationTime}
            onChange={handleInputChange}
            min="1"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="requiresIDVerification"
              checked={formData.requiresIDVerification}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <span className="text-sm">Requires ID Verification</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPrescriptionRequired"
              checked={formData.isPrescriptionRequired}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <span className="text-sm">Prescription Required</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isFragile"
              checked={formData.isFragile}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <span className="text-sm">Fragile Item</span>
          </label>
        </div>
      </div>
    </section>
  );
};

export default SafetyRestrictionsSection;
