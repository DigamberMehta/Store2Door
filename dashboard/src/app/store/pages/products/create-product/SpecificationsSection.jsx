const SpecificationsSection = ({
  specifications,
  handleNestedChange,
  keyFeatures,
  setKeyFeatures,
  customSpecs,
  setCustomSpecs,
}) => {
  const addKeyFeature = () => {
    setKeyFeatures([...keyFeatures, { key: "", value: "" }]);
  };

  const removeKeyFeature = (index) => {
    setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
  };

  const handleKeyFeatureChange = (index, field, value) => {
    const updated = [...keyFeatures];
    updated[index][field] = value;
    setKeyFeatures(updated);
  };

  const addCustomSpec = () => {
    setCustomSpecs([...customSpecs, { name: "", value: "", unit: "" }]);
  };

  const removeCustomSpec = (index) => {
    setCustomSpecs(customSpecs.filter((_, i) => i !== index));
  };

  const handleCustomSpecChange = (index, field, value) => {
    const updated = [...customSpecs];
    updated[index][field] = value;
    setCustomSpecs(updated);
  };

  return (
    <section className="bg-white border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Product Specifications
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Add basic specs, key features, and detailed product information
        </p>
      </div>

      {/* Basic Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <input
            type="text"
            value={specifications.brand}
            onChange={(e) =>
              handleNestedChange("specifications", "brand", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <input
            type="text"
            value={specifications.model}
            onChange={(e) =>
              handleNestedChange("specifications", "model", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            type="text"
            value={specifications.color}
            onChange={(e) =>
              handleNestedChange("specifications", "color", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Size</label>
          <input
            type="text"
            value={specifications.size}
            onChange={(e) =>
              handleNestedChange("specifications", "size", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Weight (g/kg)
          </label>
          <input
            type="number"
            value={specifications.weight}
            onChange={(e) =>
              handleNestedChange("specifications", "weight", e.target.value)
            }
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Material</label>
          <input
            type="text"
            value={specifications.material}
            onChange={(e) =>
              handleNestedChange("specifications", "material", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Warranty</label>
          <input
            type="text"
            value={specifications.warranty}
            onChange={(e) =>
              handleNestedChange("specifications", "warranty", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="e.g., 1 year warranty"
          />
        </div>
      </div>

      {/* Dynamic Key Features */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Key Features
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add product-specific features as key-value pairs
            </p>
          </div>
          <button
            type="button"
            onClick={addKeyFeature}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            + Add Feature
          </button>
        </div>

        {keyFeatures.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">
              No key features added yet. Click "Add Feature" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keyFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Feature Name
                    </label>
                    <input
                      type="text"
                      value={feature.key}
                      onChange={(e) =>
                        handleKeyFeatureChange(index, "key", e.target.value)
                      }
                      placeholder="e.g., Screen Size, Battery Life"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      value={feature.value}
                      onChange={(e) =>
                        handleKeyFeatureChange(index, "value", e.target.value)
                      }
                      placeholder="e.g., 6.7 inches, 5000mAh"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeKeyFeature(index)}
                  className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove feature"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Specifications / Product Details */}
      <div className="border-t pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Product Details
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add detailed specifications with optional units
            </p>
          </div>
          <button
            type="button"
            onClick={addCustomSpec}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            + Add Detail
          </button>
        </div>

        {customSpecs.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">
              No product details added yet. Click "Add Detail" to add
              specifications like dimensions, weight, etc.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {customSpecs.map((spec, index) => (
              <div
                key={index}
                className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Specification Name
                    </label>
                    <input
                      type="text"
                      value={spec.name}
                      onChange={(e) =>
                        handleCustomSpecChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Screen Size, Weight"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) =>
                        handleCustomSpecChange(index, "value", e.target.value)
                      }
                      placeholder="e.g., 6.7, 200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Unit (Optional)
                    </label>
                    <input
                      type="text"
                      value={spec.unit}
                      onChange={(e) =>
                        handleCustomSpecChange(index, "unit", e.target.value)
                      }
                      placeholder="e.g., inches, grams"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomSpec(index)}
                  className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove specification"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SpecificationsSection;
