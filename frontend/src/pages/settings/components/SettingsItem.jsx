import { ChevronRight } from "lucide-react";

const SettingsItem = ({ icon: Icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-3 active:bg-white/10 transition-all text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/5 rounded-lg">
            <Icon className="w-4 h-4 text-white/70" />
          </div>
          <span className="text-white font-medium text-xs">{label}</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-white/30" />
      </div>
    </button>
  );
};

export default SettingsItem;
