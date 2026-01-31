import { FileText, Shield, Share2, Star, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="text-white/40 text-[10px] uppercase tracking-wider font-semibold px-2 mb-2">
        About
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => navigate("/about")}
          className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-3 active:bg-white/10 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <FileText className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white font-medium text-xs">About us</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          </div>
        </button>

        <button className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-3 active:bg-white/10 transition-all text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <Star className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white font-medium text-xs">Rate app</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              <span className="text-white/70 text-[10px] font-semibold">
                4.8
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/terms")}
          className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-3 active:bg-white/10 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <FileText className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white font-medium text-xs">
                Terms of service
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          </div>
        </button>

        <button
          onClick={() => navigate("/privacy")}
          className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-3 active:bg-white/10 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <Shield className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white font-medium text-xs">
                Privacy policy
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
                <Share2 className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white font-medium text-xs">Share app</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          </div>
        </button>

        <div className="pt-1 pb-2 text-center">
          <p className="text-white/30 text-[10px]">Version 2.1.0</p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
