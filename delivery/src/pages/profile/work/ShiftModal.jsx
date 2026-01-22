import { LuX, LuCheck } from "react-icons/lu";

const ShiftModal = ({
  show,
  onClose,
  shifts,
  selectedShifts,
  onShiftToggle,
  onUpdate,
  updating,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Select Active Shift</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <LuX className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-none">
            {shifts.map((shift) => (
              <button
                key={shift}
                onClick={() => onShiftToggle(shift)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  selectedShifts.includes(shift)
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                    : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                }`}
              >
                <span className="font-semibold text-sm">{shift}</span>
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedShifts.includes(shift)
                      ? "bg-blue-500 border-blue-500"
                      : "border-zinc-700"
                  }`}
                >
                  {selectedShifts.includes(shift) && (
                    <LuCheck className="w-3.5 h-3.5 text-white stroke-[3px]" />
                  )}
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onUpdate}
            disabled={updating}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 py-4 rounded-2xl font-bold mt-6 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;
