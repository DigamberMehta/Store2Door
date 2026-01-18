import { HelpCircle, Headphones, MessageCircle } from "lucide-react";
import SettingsSection from "./SettingsSection";
import SettingsItem from "./SettingsItem";

const SupportSection = () => {
  return (
    <SettingsSection title="Support">
      <SettingsItem icon={HelpCircle} label="Help center" onClick={() => {}} />
      <SettingsItem icon={Headphones} label="Contact us" onClick={() => {}} />
      <SettingsItem
        icon={MessageCircle}
        label="Chat with us"
        onClick={() => {}}
      />
    </SettingsSection>
  );
};

export default SupportSection;
