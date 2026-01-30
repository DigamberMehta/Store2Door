const StatusBadge = ({ status }) => {
  const getStatusText = () => {
    switch (status) {
      case "assigned":
        return "Heading to Store";
      case "picked_up":
        return "Picked Up";
      case "on_the_way":
      case "in_transit":
        return "Delivering to Customer";
      case "delivered":
        return "Delivered";
      default:
        return "In Progress";
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 border border-black/10">
      <div
        className={`w-2.5 h-2.5 rounded-full animate-pulse ${
          status === "delivered" ? "bg-gray-400" : "bg-emerald-500"
        }`}
      />
      <span className="text-sm font-semibold text-black">
        {getStatusText()}
      </span>
    </div>
  );
};

export default StatusBadge;
