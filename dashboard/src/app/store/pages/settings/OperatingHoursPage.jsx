import { useState, useEffect } from "react";
import { Save, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { storeAPI } from "../../../../services/store/api/store.api";

const OperatingHoursPage = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingStore, setFetchingStore] = useState(true);
  const [operatingHours, setOperatingHours] = useState([]);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const fetchStoreProfile = async () => {
    try {
      setFetchingStore(true);
      const response = await storeAPI.getMyOperatingHours();

      if (response.success) {
        const store = response.data;
        // Map backend data to frontend format
        if (store.operatingHours && store.operatingHours.length > 0) {
          const mappedHours = store.operatingHours.map((hour) => ({
            day: hour.day,
            openTime: hour.openTime || "09:00",
            closeTime: hour.closeTime || "18:00",
            isOpen: hour.isOpen !== undefined ? hour.isOpen : true,
            _id: hour._id,
          }));
          setOperatingHours(mappedHours);
        } else {
          // Initialize with defaults if no data
          const defaultHours = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ].map((day) => ({
            day,
            openTime: "09:00",
            closeTime: "18:00",
            isOpen: true,
          }));
          setOperatingHours(defaultHours);
        }
      }
    } catch (error) {
      console.error("Error fetching store:", error);
      toast.error("Failed to load operating hours");
    } finally {
      setFetchingStore(false);
    }
  };

  const handleHourChange = (dayIndex, field, value) => {
    const updated = [...operatingHours];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setOperatingHours(updated);
  };

  const handleToggleClosed = (dayIndex) => {
    const updated = [...operatingHours];
    updated[dayIndex].isOpen = !updated[dayIndex].isOpen;
    setOperatingHours(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format data for backend
      const formattedHours = operatingHours.map((hour) => ({
        day: hour.day.toLowerCase(),
        isOpen: hour.isOpen,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
      }));

      const response = await storeAPI.updateOperatingHours(formattedHours);

      if (response.success) {
        toast.success("Operating hours updated successfully!");
      }
    } catch (error) {
      console.error("Error updating hours:", error);
      toast.error("Failed to update operating hours");
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-lg font-bold text-gray-900">Operating Hours</h1>
        <p className="text-xs text-gray-500 mt-1">
          Set your store operating hours for each day of the week
        </p>
      </div>

      <div className="px-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Operating Hours Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-green-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Store Hours
              </h2>
            </div>

            <div className="space-y-3">
              {operatingHours.map((hour, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                >
                  {/* Day Label */}
                  <div className="w-24 flex-shrink-0">
                    <p className="font-medium text-gray-900 capitalize">
                      {hour.day}
                    </p>
                  </div>

                  {/* Hours Input or Closed Badge */}
                  {!hour.isOpen ? (
                    <div className="flex-1 flex items-center">
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
                        Closed
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) =>
                            handleHourChange(index, "openTime", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                        />
                        <span className="text-gray-500 font-medium">to</span>
                        <input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) =>
                            handleHourChange(index, "closeTime", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Toggle Closed Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleClosed(index)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      !hour.isOpen
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                    }`}
                  >
                    {!hour.isOpen ? "Open" : "Mark Closed"}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-4 px-4">
              Toggle "Mark Closed" to set a day as closed. The store will not
              accept orders on closed days.
            </p>
          </div>

          {/* Submit Button */}
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
        </form>
      </div>
    </div>
  );
};

export default OperatingHoursPage;
