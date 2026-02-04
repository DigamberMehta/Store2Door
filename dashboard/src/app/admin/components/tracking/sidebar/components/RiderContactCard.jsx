import { User, Phone, Mail, Clock } from "lucide-react";

const RiderContactCard = ({ userId, lastActiveAt, formatTime }) => {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-xs text-gray-700 mb-2.5 flex items-center gap-1.5">
        <User className="w-4 h-4 text-green-600" />
        Contact Information
      </h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 font-medium">
            {userId?.phone || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 truncate">
            {userId?.email || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">
            Last active: {formatTime(lastActiveAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiderContactCard;
