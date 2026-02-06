import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { riderAPI } from "../../../../../services/admin/api/rider.api";

const AssignRiderModal = ({ order, onClose, onSubmit }) => {
  const [riders, setRiders] = useState([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingRiders, setFetchingRiders] = useState(true);

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      setFetchingRiders(true);
      const response = await riderAPI.getAllRiders({
        status: "active",
        limit: 100,
      });
      if (response.success) {
        setRiders(response.data.riders || []);
      }
    } catch (error) {
      console.error("Error fetching riders:", error);
    } finally {
      setFetchingRiders(false);
    }
  };

  const filteredRiders = riders.filter(
    (rider) =>
      rider.name?.toLowerCase().includes(search.toLowerCase()) ||
      rider.email?.toLowerCase().includes(search.toLowerCase()) ||
      rider.phone?.includes(search),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRiderId) return;

    setLoading(true);
    await onSubmit({ riderId: selectedRiderId, notifyRider: true });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Assign Rider</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search Riders
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Select Rider *
            </label>
            {fetchingRiders ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredRiders.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-3">
                No active riders found
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                {filteredRiders.map((rider) => (
                  <label
                    key={rider._id}
                    className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="rider"
                      value={rider._id}
                      checked={selectedRiderId === rider._id}
                      onChange={(e) => setSelectedRiderId(e.target.value)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-2 flex-1">
                      <div className="flex items-center">
                        {rider.profilePhoto ? (
                          <img
                            src={rider.profilePhoto}
                            alt={rider.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-gray-600">
                              {rider.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rider.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {rider.phone} • {rider.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRiderId}
              className="flex-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Assign Rider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignRiderModal;
