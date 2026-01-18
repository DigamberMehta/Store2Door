import { User, MapPin, CreditCard } from "lucide-react";
import SettingsSection from "./SettingsSection";
import SettingsItem from "./SettingsItem";

const AccountSection = ({ onProfileClick }) => {
  return (
    <SettingsSection title="Account">
      <SettingsItem
        icon={User}
        label="Profile details"
        onClick={onProfileClick}
      />
      <SettingsItem icon={MapPin} label="Saved addresses" onClick={() => {}} />
      <SettingsItem
        icon={CreditCard}
        label="Payment methods"
        onClick={() => {}}
      />
    </SettingsSection>
  );
};

export default AccountSection;
