import { useState } from "react";

const NutritionSection = ({ nutrition, handleNestedChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="bg-white border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Nutrition Information
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Optional - Add if this is a food/beverage product
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
        >
          {isExpanded ? "Hide Details" : "Add Nutrition Info"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Primary nutrition facts */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Main Nutrition Facts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Calories
                </label>
                <input
                  type="number"
                  value={nutrition.calories}
                  onChange={(e) =>
                    handleNestedChange("nutrition", "calories", e.target.value)
                  }
                  min="0"
                  placeholder="e.g., 250"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={nutrition.protein}
                  onChange={(e) =>
                    handleNestedChange("nutrition", "protein", e.target.value)
                  }
                  min="0"
                  step="0.1"
                  placeholder="e.g., 12.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Carbohydrates (g)
                </label>
                <input
                  type="number"
                  value={nutrition.carbohydrates}
                  onChange={(e) =>
                    handleNestedChange(
                      "nutrition",
                      "carbohydrates",
                      e.target.value,
                    )
                  }
                  min="0"
                  step="0.1"
                  placeholder="e.g., 35.0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Total Fat (g)
                </label>
                <input
                  type="number"
                  value={nutrition.fat}
                  onChange={(e) =>
                    handleNestedChange("nutrition", "fat", e.target.value)
                  }
                  min="0"
                  step="0.1"
                  placeholder="e.g., 8.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Additional nutrition details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Additional Details (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Sugar (g)
                </label>
                <input
                  type="number"
                  value={nutrition.sugar}
                  onChange={(e) =>
                    handleNestedChange("nutrition", "sugar", e.target.value)
                  }
                  min="0"
                  step="0.1"
                  placeholder="e.g., 5.0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Serving Size
                </label>
                <input
                  type="text"
                  value={nutrition.servingSize}
                  onChange={(e) =>
                    handleNestedChange(
                      "nutrition",
                      "servingSize",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 1 cup (240ml)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Servings Per Container
                </label>
                <input
                  type="number"
                  value={nutrition.servingsPerContainer || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "nutrition",
                      "servingsPerContainer",
                      e.target.value,
                    )
                  }
                  min="1"
                  placeholder="e.g., 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default NutritionSection;
