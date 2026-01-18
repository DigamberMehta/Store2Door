import { Bell, Moon, Globe } from "lucide-react";
import SettingsSection from "./SettingsSection";
import SettingsItem from "./SettingsItem";

const PreferencesSection = () => {
  return (
    <SettingsSection title="Preferences">
      <SettingsItem icon={Bell} label="Notifications" onClick={() => {}} />
      <SettingsItem icon={Moon} label="Appearance" onClick={() => {}} />
      <SettingsItem icon={Globe} label="Language & region" onClick={() => {}} />
    </SettingsSection>
  );
};

export default PreferencesSection;
