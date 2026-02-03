import { Clock, ToggleLeft, ToggleRight } from "lucide-react";

const ActivityInformationSection = ({
  profile,
  onToggleStatus,
  formatDate,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-gray-700" />
        <h2 className="text-base font-semibold text-gray-900">
          Activity Information
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <span className="text-xs text-gray-500">Joined Date</span>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(profile.createdAt)}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Last Active</span>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(profile.lastActiveAt)}
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Currently Available</span>
            <button
              onClick={() => onToggleStatus("isAvailable", profile.isAvailable)}
              className={`p-1 rounded transition-colors ${
                profile.isAvailable
                  ? "text-green-600 hover:bg-green-50"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={profile.isAvailable ? "Set Unavailable" : "Set Available"}
            >
              {profile.isAvailable ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
          </div>
          <p
            className={`text-sm font-medium ${
              profile.isAvailable ? "text-green-600" : "text-gray-500"
            }`}
          >
            {profile.isAvailable ? "Available" : "Unavailable"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityInformationSection;
