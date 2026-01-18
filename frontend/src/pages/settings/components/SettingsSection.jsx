const SettingsSection = ({ title, children }) => {
  return (
    <div>
      <h3 className="text-white/40 text-[10px] uppercase tracking-wider font-semibold px-2 mb-2">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

export default SettingsSection;
