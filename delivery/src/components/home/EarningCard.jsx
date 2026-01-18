import { DollarSign } from "lucide-react";

const EarningCard = () => {
  const earnings = {
    today: 157.34
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl pt-0 px-4 pb-4 mx-2 mt-2 shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative z-10 border border-white/5">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest pt-4">Your Earnings</h3>
          <span className="text-[8px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 tracking-widest uppercase mt-4">Today</span>
        </div>

        {/* Main Earning Display */}
        <div className="flex items-baseline gap-1">
          <DollarSign className="w-4 h-4 text-emerald-500/80" />
          <span className="text-3xl font-medium text-white tracking-tight">{earnings.today.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default EarningCard;
