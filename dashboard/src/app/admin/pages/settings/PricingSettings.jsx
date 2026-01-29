import { useState, useEffect } from "react";
import { Save, Info } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const PricingSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(20);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminAuthToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/platform-settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const settings = response.data?.data || response.data;
      setMarkupPercentage(settings.markupPercentage || 20);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load pricing settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("adminAuthToken");
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/platform-settings`,
        { markupPercentage: parseFloat(markupPercentage) },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Pricing settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update pricing settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pricing Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure markup percentage for store products
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Markup Works</p>
            <p>
              When store managers set a product price, this markup percentage is
              automatically added to calculate the final customer price. For
              example, if a manager sets R100 and markup is 20%, customers will
              see R120.
            </p>
          </div>
        </div>

        {/* Markup Percentage Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Markup Percentage
          </label>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            <div className="text-sm text-gray-600">(0% - 100%)</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This percentage will be added to all store manager prices
          </p>
        </div>

        {/* Example Calculation */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Example Calculation
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Store Manager Price:</span>
              <span className="font-medium">R100.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                Markup ({markupPercentage}%):
              </span>
              <span className="font-medium text-green-600">
                +R{((100 * parseFloat(markupPercentage || 0)) / 100).toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-300 flex justify-between">
              <span className="text-gray-900 font-semibold">
                Customer Price:
              </span>
              <span className="font-bold text-lg text-green-600">
                R
                {(
                  100 +
                  (100 * parseFloat(markupPercentage || 0)) / 100
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingSettings;
