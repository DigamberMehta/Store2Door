const DietaryAttributesSection = ({ formData, handleInputChange }) => {
  const attributes = [
    {
      name: "isVegetarian",
      label: "Vegetarian",
      desc: "No meat or fish",
    },
    { name: "isVegan", label: "Vegan", desc: "No animal products" },
    {
      name: "isGlutenFree",
      label: "Gluten Free",
      desc: "No gluten",
    },
    {
      name: "isOrganic",
      label: "Organic",
      desc: "Certified organic",
    },
    { name: "isHalal", label: "Halal", desc: "Halal certified" },
    { name: "isKosher", label: "Kosher", desc: "Kosher certified" },
    { name: "isDairyFree", label: "Dairy Free", desc: "No dairy" },
    { name: "isNutFree", label: "Nut Free", desc: "No nuts" },
  ];

  return (
    <section className="bg-white border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Dietary & Food Attributes
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Select all dietary attributes that apply to this food product
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {attributes.map((attr) => (
          <label
            key={attr.name}
            className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              formData[attr.name]
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              name={attr.name}
              checked={formData[attr.name]}
              onChange={handleInputChange}
              className="w-5 h-5 text-green-600 rounded mt-0.5 focus:ring-2 focus:ring-green-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {attr.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{attr.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
};

export default DietaryAttributesSection;
