import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driverProfileAPI } from "../../../services/api";
import toast from "react-hot-toast";
import { LuChevronLeft, LuSave, LuTruck } from "react-icons/lu";

const VehicleDetailsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    type: "",
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
  });

  useEffect(() => {
    fetchVehicleData();
  }, []);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      const response = await driverProfileAPI.getProfile();
      const vehicleData = response.data.profile?.vehicle;
      if (vehicleData) {
        setVehicleForm({
          type: vehicleData.type || "",
          make: vehicleData.make || "",
          model: vehicleData.model || "",
          year: vehicleData.year || "",
          color: vehicleData.color || "",
          licensePlate: vehicleData.licensePlate || "",
        });
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      toast.error("Failed to load vehicle details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!vehicleForm.type) {
      toast.error("Please select a vehicle type");
      return;
    }

    try {
      setUpdating(true);
      await driverProfileAPI.updateVehicle(vehicleForm);
      toast.success("Vehicle details updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating vehicle details:", error);
      toast.error(
        error.response?.data?.message || "Failed to update vehicle details",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 active:bg-white/5 rounded-full transition-colors"
          >
            <LuChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <LuTruck className="w-4 h-4 text-blue-300" />
            <p className="text-md font-bold">Vehicle Details</p>
          </div>
        </div>
      </div>

      <div className="px-3 pt-4 space-y-4">
        {/* Vehicle Basic Info */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 space-y-3">
          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Vehicle Type <span className="text-red-400">*</span>
            </label>
            <select
              value={vehicleForm.type}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, type: e.target.value })
              }
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors"
            >
              <option value="">Select vehicle type</option>
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="scooter">Scooter</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
              <option value="electric_bike">Electric Bike</option>
              <option value="walking">Walking</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Make / Brand
            </label>
            <input
              type="text"
              value={vehicleForm.make}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, make: e.target.value })
              }
              placeholder="e.g., Toyota, Honda, Yamaha"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Model
            </label>
            <input
              type="text"
              value={vehicleForm.model}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, model: e.target.value })
              }
              placeholder="e.g., Corolla, CBR, Activa"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
                Year
              </label>
              <input
                type="number"
                value={vehicleForm.year}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, year: e.target.value })
                }
                placeholder="2020"
                min="1990"
                max={new Date().getFullYear() + 1}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
                Color
              </label>
              <input
                type="text"
                value={vehicleForm.color}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, color: e.target.value })
                }
                placeholder="Black"
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>

        {/* License Plate */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 space-y-3">
          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              License Plate
            </label>
            <input
              type="text"
              value={vehicleForm.licensePlate}
              onChange={(e) =>
                setVehicleForm({
                  ...vehicleForm,
                  licensePlate: e.target.value.toUpperCase(),
                })
              }
              placeholder="CA 123-456"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm uppercase focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={updating}
          className="w-full bg-blue-500 active:bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
        >
          {updating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"  />
              Updating...
            </>
          ) : (
            <>
              <LuSave className="w-4 h-4" />
              Save Vehicle Details
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
