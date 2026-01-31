import { HelpCircle, MessageCircle, ChevronRight } from "lucide-react";

const SupportSection = () => {
  return (
    <div>
      <h3 className="text-white/40 text-[10px] uppercase tracking-wider font-semibold px-2 mb-2">
        Support
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => {}}
          className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-3 active:bg-white/10 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <HelpCircle className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white font-medium text-xs">
                Help center
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          </div>
        </button>
        <button
          onClick={() => {}}
          className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-3 active:bg-white/10 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <MessageCircle className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white font-medium text-xs">
                Chat with us
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default SupportSection;
