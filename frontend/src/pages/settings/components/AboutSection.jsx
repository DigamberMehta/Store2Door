import { FileText, Shield, Share2, Star } from "lucide-react";
import { ChevronRight } from "lucide-react";
import SettingsSection from "./SettingsSection";
import SettingsItem from "./SettingsItem";

const AboutSection = () => {
  return (
    <SettingsSection title="About">
      <button className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-3 active:bg-white/10 transition-all text-left">
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
            <span className="text-white/70 text-[10px] font-semibold">4.8</span>
          </div>
        </div>
      </button>

      <SettingsItem
        icon={FileText}
        label="Terms of service"
        onClick={() => {}}
      />
      <SettingsItem icon={Shield} label="Privacy policy" onClick={() => {}} />
      <SettingsItem icon={Share2} label="Share app" onClick={() => {}} />

      <div className="pt-1 pb-2 text-center">
        <p className="text-white/30 text-[10px]">Version 2.1.0</p>
      </div>
    </SettingsSection>
  );
};

export default AboutSection;
