import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driverProfileAPI } from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  Plus,
  X,
  Map,
  CheckCircle2,
  Search,
  Navigation,
} from "lucide-react";

const PreferredAreasPage = () => {
  const navigate = useNavigate();
  const [newArea, setNewArea] = useState("");
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const suggestedAreas = [
    "North Delhi",
    "East Delhi",
    "West Delhi",
    "South Delhi",
    "Gurgaon",
    "Noida",
    "Dwarka",
    "Rohini",
    "Janakpuri",
    "Saket",
    "DLF Phase 3",
  ];

  // Fetch existing preferred areas
  useEffect(() => {
    fetchPreferredAreas();
  }, []);

  const fetchPreferredAreas = async () => {
    try {
      setLoading(true);
      const response = await driverProfileAPI.getProfile();
      const areas = response.data.profile?.serviceAreas || [];
      setSelectedAreas(areas);
    } catch (error) {
      console.error("Error fetching preferred areas:", error);
      toast.error("Failed to load preferred areas");
    } finally {
      setLoading(false);
    }
  };

  const savePreferredAreas = async () => {
    try {
      setSaving(true);
      await driverProfileAPI.updateWorkAreas(selectedAreas);
      toast.success("Preferred areas updated successfully!");
      setTimeout(() => navigate(-1), 500);
    } catch (error) {
      console.error("Error saving preferred areas:", error);
      toast.error(
        error.response?.data?.message || "Failed to save preferred areas",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleArea = (area) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const addCustomArea = () => {
    if (newArea.trim() && !selectedAreas.includes(newArea.trim())) {
      setSelectedAreas([...selectedAreas, newArea.trim()]);
      setNewArea("");
    }
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="pt-8 px-4 pb-4 bg-zinc-900/50 backdrop-blur-xl border-b border-white/5 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="bg-white/5 p-1.5 rounded-full border border-white/5 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div>
          <h1 className="text-lg font-bold">Preferred Areas</h1>
          <p className="text-[10px] text-zinc-500 font-medium">
            Select locations where you want to work
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="p-4 space-y-6 flex-1">
            {/* Search/Add Section */}
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-widest font-extrabold text-zinc-500 ml-1">
                Add Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomArea()}
                  placeholder="Enter area name..."
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-16 text-xs focus:border-blue-300/50 outline-none transition-all placeholder:text-zinc-600"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />

                {newArea && (
                  <button
                    onClick={addCustomArea}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-300 text-black px-3 py-1.5 rounded-xl text-[10px] font-extrabold active:scale-90 transition-transform"
                  >
                    ADD
                  </button>
                )}
              </div>
            </div>

            {/* Selected Areas */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] uppercase tracking-widest font-extrabold text-zinc-500">
                  Selected ({selectedAreas.length})
                </label>
                {selectedAreas.length > 0 && (
                  <button
                    onClick={() => setSelectedAreas([])}
                    className="text-[9px] text-zinc-600 font-extrabold uppercase hover:text-red-400"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedAreas.length > 0 ? (
                  selectedAreas.map((area) => (
                    <div
                      key={area}
                      className="bg-blue-300/10 border border-blue-300/30 px-3 py-1.5 rounded-full flex items-center gap-2 group animate-in zoom-in duration-200"
                    >
                      <span className="text-xs font-bold text-blue-200">
                        {area}
                      </span>
                      <button
                        onClick={() => toggleArea(area)}
                        className="p-0.5 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-blue-300/50" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-6 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                    <Map className="w-6 h-6 text-zinc-800 mx-auto mb-1.5" />
                    <p className="text-zinc-600 text-[10px] font-medium">
                      No areas selected yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Areas */}
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-widest font-extrabold text-zinc-500 px-1">
                Nearby & Suggested
              </label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedAreas
                  .filter((a) => !selectedAreas.includes(a))
                  .map((area) => (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/5 rounded-2xl text-left active:bg-white/10 active:scale-95 transition-all"
                    >
                      <div className="bg-zinc-800 p-1.5 rounded-lg">
                        <Navigation className="w-3 h-3 text-zinc-500" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-400">
                        {area}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      {!loading && (
        <div className="p-4 pb-10 bg-gradient-to-t from-black to-transparent">
          <button
            onClick={savePreferredAreas}
            disabled={saving}
            className="w-full bg-blue-300 hover:bg-blue-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black py-3.5 rounded-2xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-300/10"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span className="text-sm font-extrabold">SAVING...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-extrabold">
                  CONFIRM SELECTIONS
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PreferredAreasPage;
