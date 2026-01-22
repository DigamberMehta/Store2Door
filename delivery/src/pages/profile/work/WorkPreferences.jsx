import { LuClock, LuMap, LuChevronRight } from "react-icons/lu";

const WorkPreferences = ({
  user,
  selectedShifts,
  onShiftClick,
  onAreasClick,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">
          Work Preferences
        </h3>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 space-y-4">
          {/* Shift Selection */}
          <button
            onClick={onShiftClick}
            className="w-full text-left space-y-2.5 active:bg-white/5 p-1.5 rounded-xl transition-colors"
          >
            <div className="flex justify-between items-center">
              <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-2">
                <LuClock className="w-3 h-3" /> Selected Shifts (
                {selectedShifts.length})
              </p>
              <LuChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedShifts.length > 0 ? (
                selectedShifts.slice(0, 3).map((shift, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-300/10 border border-blue-300/20 px-2.5 py-1 rounded-lg"
                  >
                    <span className="text-blue-200 font-bold text-[10px]">
                      {typeof shift === "string"
                        ? shift.replace(":00 ", " ")
                        : shift}
                    </span>
                  </div>
                ))
              ) : (
                <div className="bg-zinc-800/50 border border-white/5 px-2.5 py-1 rounded-lg">
                  <span className="text-zinc-600 font-bold text-[10px]">
                    No shifts selected
                  </span>
                </div>
              )}
              {selectedShifts.length > 3 && (
                <div className="bg-zinc-800/50 border border-white/5 px-2 py-1 rounded-lg">
                  <span className="text-zinc-500 font-bold text-[10px]">
                    +{selectedShifts.length - 3} more
                  </span>
                </div>
              )}
            </div>
          </button>

          {/* Area Selection */}
          <button
            onClick={onAreasClick}
            className="w-full text-left space-y-2.5 active:bg-white/5 p-1.5 rounded-xl transition-colors"
          >
            <div className="flex justify-between items-center">
              <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-2">
                <LuMap className="w-3 h-3" /> Preferred Areas (
                {user.preferences.areas.length})
              </p>
              <LuChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.preferences.areas.map((area) => (
                <div
                  key={area}
                  className="bg-zinc-800/80 border border-white/5 px-2.5 py-1 rounded-lg"
                >
                  <span className="text-zinc-400 font-bold text-[10px]">
                    {area}
                  </span>
                </div>
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkPreferences;
