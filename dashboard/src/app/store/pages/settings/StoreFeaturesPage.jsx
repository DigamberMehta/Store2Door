import { useState, useEffect } from "react";
import { Save, CheckCircle2, Star, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { storeAPI } from "../../../../services/store/api/store.api";

const StoreFeaturesPage = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingStore, setFetchingStore] = useState(true);
  const [features, setFeatures] = useState([]);
  const isReadOnly = true; // Store managers can only view, not edit

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const fetchStoreProfile = async () => {
    try {
      setFetchingStore(true);
      const response = await storeAPI.getMyFeatures();

      if (response.success) {
        const store = response.data;
        setFeatures(store.features || []);
      }
    } catch (error) {
      console.error("Error fetching store:", error);
      toast.error("Failed to load store features");
    } finally {
      setFetchingStore(false);
    }
  };

  const handleFeatureToggle = (feature) => {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await storeAPI.update({ features });

      if (response.success) {
        toast.success("Store features updated successfully!");
      }
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error("Failed to update store features");
    } finally {
      setLoading(false);
    }
  };

  const featureCategories = [
    {
      title: "Payment Options",
      icon: DollarSign,
      features: ["Cash on Delivery", "Card Payment", "Mobile Money"],
    },
    {
      title: "Food Features",
      icon: Utensils,
      features: [
        "Halal Food",
        "Vegan Options",
        "Gluten-Free Options",
        "Organic Products",
        "Farm-to-Table",
      ],
    },
    {
      title: "General Features",
      icon: Star,
      features: [
        "Free Wi-Fi",
        "Parking Available",
        "Wheelchair Accessible",
        "Pet Friendly",
        "Gift Wrapping",
        "Loyalty Program",
        "Same-Day Delivery",
        "Click & Collect",
      ],
    },
    {
      title: "Special Services",
      icon: CheckCircle2,
      features: [
        "24/7 Open",
        "Catering Service",
        "Party Supplies",
        "Custom Orders",
        "Subscription Service",
        "Gift Cards",
        "Personal Shopping",
        "Installation Service",
      ],
    },
  ];

  if (fetchingStore) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <h1 className="text-lg font-bold text-gray-900">Store Features</h1>
        <p className="text-xs text-gray-500 mt-1">
          Select features and services offered by your store
        </p>
      </div>

      <div className="px-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {featureCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-green-600" />
                  <h2 className="text-base font-semibold text-gray-900">
                    {category.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.features.map((feature) => (
                    <label
                      key={feature}
                      className={`
                        flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${
                          features.includes(feature)
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        disabled={isReadOnly}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500/20"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Submit Button */}
          {!isReadOnly && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Helper icons
const DollarSign = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const Utensils = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
    <path d="M7 2v20"></path>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
  </svg>
);

export default StoreFeaturesPage;
