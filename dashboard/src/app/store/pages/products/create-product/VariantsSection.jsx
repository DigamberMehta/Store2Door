const VariantsSection = ({ variants, setVariants }) => {
  const addVariant = () => {
    setVariants([
      ...variants,
      { name: "", value: "", priceModifier: "", isDefault: false },
    ]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const setAsDefault = (index) => {
    const updated = variants.map((v, i) => ({
      ...v,
      isDefault: i === index,
    }));
    setVariants(updated);
  };

  return (
    <section className="bg-white border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Product Variants
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Add different sizes, weights, or package options (e.g., 500g, 1kg,
          2kg)
        </p>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              What are variants?
            </h3>
            <p className="text-xs text-blue-800">
              Variants allow you to sell the same product in different sizes or
              packages. For example: Milk - 500ml (R25), 1L (R45), 2L (R85). The
              price modifier is added to the base price.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          {variants.length === 0 ? (
            <span>No variants added - Product will use base price only</span>
          ) : (
            <span>
              {variants.length} variant{variants.length !== 1 ? "s" : ""} added
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          + Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-gray-500 text-sm mb-1">No variants added yet</p>
          <p className="text-gray-400 text-xs">
            Click "Add Variant" if this product comes in different sizes or
            packages
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                variant.isDefault
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Variant Type
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Size, Weight"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      value={variant.value}
                      onChange={(e) =>
                        handleVariantChange(index, "value", e.target.value)
                      }
                      placeholder="e.g., 500g, 1kg, Large"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Price Modifier (ZAR)
                    </label>
                    <input
                      type="number"
                      value={variant.priceModifier}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "priceModifier",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 0, 20, 50"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Added to base price
                    </p>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAsDefault(index)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        variant.isDefault
                          ? "bg-green-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {variant.isDefault ? "✓ Default" : "Set Default"}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove variant"
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

              {variant.isDefault && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>This variant will be selected by default</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {variants.length > 0 && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Preview:</h4>
          <div className="space-y-1">
            {variants.map((variant, index) => (
              <div key={index} className="text-xs text-gray-600">
                <span className="font-medium">
                  {variant.value || "Unnamed"}
                </span>
                {" - "}
                <span>Base Price + R{variant.priceModifier || "0"}</span>
                {variant.isDefault && (
                  <span className="ml-2 text-green-600">(Default)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default VariantsSection;
