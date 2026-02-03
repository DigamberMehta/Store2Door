import { Shield, ToggleLeft, ToggleRight } from "lucide-react";

const AccountStatusSection = ({ profile, onToggleStatus, formatDate }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-gray-700" />
        <h2 className="text-base font-semibold text-gray-900">
          Account Status & Controls
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Account Status</span>
            <button
              onClick={() => onToggleStatus("isActive", profile.isActive)}
              className={`p-1 rounded transition-colors ${
                profile.isActive
                  ? "text-green-600 hover:bg-green-50"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={profile.isActive ? "Deactivate" : "Activate"}
            >
              {profile.isActive ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
          </div>
          <p
            className={`text-sm font-medium ${
              profile.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {profile.isActive ? "Active" : "Inactive"}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Suspended</span>
            <button
              onClick={() => onToggleStatus("isSuspended", profile.isSuspended)}
              className={`p-1 rounded transition-colors ${
                profile.isSuspended
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={profile.isSuspended ? "Unsuspend" : "Suspend"}
            >
              {profile.isSuspended ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
          </div>
          <p
            className={`text-sm font-medium ${
              profile.isSuspended ? "text-red-600" : "text-green-600"
            }`}
          >
            {profile.isSuspended ? "Yes" : "No"}
          </p>
        </div>

        {profile.isSuspended && profile.suspensionReason && (
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-xs text-gray-500">Suspension Reason</span>
            <p className="text-sm font-medium text-gray-900">
              {profile.suspensionReason}
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Verification Status</span>
            <button
              onClick={() => onToggleStatus("isVerified", profile.isVerified)}
              className={`p-1 rounded transition-colors ${
                profile.isVerified
                  ? "text-green-600 hover:bg-green-50"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={
                profile.isVerified ? "Mark as Unverified" : "Mark as Verified"
              }
            >
              {profile.isVerified ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
          </div>
          <p
            className={`text-sm font-medium ${
              profile.isVerified ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {profile.isVerified ? "Verified" : "Pending Verification"}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Onboarding</span>
            <button
              onClick={() =>
                onToggleStatus(
                  "onboardingCompleted",
                  profile.onboardingCompleted,
                )
              }
              className={`p-1 rounded transition-colors ${
                profile.onboardingCompleted
                  ? "text-green-600 hover:bg-green-50"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={
                profile.onboardingCompleted
                  ? "Mark as Incomplete"
                  : "Mark as Complete"
              }
            >
              {profile.onboardingCompleted ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
          </div>
          <p
            className={`text-sm font-medium ${
              profile.onboardingCompleted ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {profile.onboardingCompleted ? "Completed" : "In Progress"}
          </p>
        </div>

        {profile.onboardingCompleted && profile.approvedAt && (
          <div>
            <span className="text-xs text-gray-500">Approved On</span>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(profile.approvedAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountStatusSection;
