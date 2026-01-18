import { ShoppingBag, Star, Gift } from "lucide-react";
import SettingsSection from "./SettingsSection";
import SettingsItem from "./SettingsItem";

const OrdersSection = () => {
  return (
    <SettingsSection title="Orders & Activity">
      <SettingsItem icon={ShoppingBag} label="Your orders" onClick={() => {}} />
      <SettingsItem icon={Star} label="Favorites" onClick={() => {}} />
      <SettingsItem icon={Gift} label="Offers & rewards" onClick={() => {}} />
    </SettingsSection>
  );
};

export default OrdersSection;
