import {
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const UserBasicInfo = ({ user }) => {
  const getRoleBadge = (role) => {
    const roleColors = {
      customer: "bg-blue-100 text-blue-800",
      store_manager: "bg-purple-100 text-purple-800",
      delivery_rider: "bg-orange-100 text-orange-800",
      admin: "bg-red-100 text-red-800",
    };

    const roleLabels = {
      customer: "Customer",
      store_manager: "Store Manager",
      delivery_rider: "Delivery Rider",
      admin: "Admin",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[role] || "bg-gray-100 text-gray-800"}`}
      >
        {roleLabels[role] || role}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-base font-semibold text-gray-900 mb-3">
        Basic Information
      </h2>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="flex-1 space-y-3 w-full">
          {/* Name and Role */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {user.name}
            </h3>
            <div className="mt-1.5">{getRoleBadge(user.role)}</div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 text-gray-600">
              <Mail className="w-4 h-4 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-xs text-gray-500 block">Email</span>
                <p className="text-sm font-medium text-gray-900 break-words">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <Phone className="w-4 h-4 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-xs text-gray-500 block">Phone</span>
                <p className="text-sm font-medium text-gray-900">
                  {user.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Status and Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
            <div>
              <span className="text-xs text-gray-500 block mb-1">
                Account Status
              </span>
              <div className="flex items-center gap-1.5">
                {user.isActive ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                )}
                <p
                  className={`text-sm font-medium ${user.isActive ? "text-green-600" : "text-red-600"}`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 block mb-1">
                Email Verified
              </span>
              <div className="flex items-center gap-1.5">
                {user.isEmailVerified ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-gray-400" />
                )}
                <p
                  className={`text-sm font-medium ${user.isEmailVerified ? "text-green-600" : "text-gray-500"}`}
                >
                  {user.isEmailVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 block mb-1">
                Phone Verified
              </span>
              <div className="flex items-center gap-1.5">
                {user.isPhoneVerified ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-gray-400" />
                )}
                <p
                  className={`text-sm font-medium ${user.isPhoneVerified ? "text-green-600" : "text-gray-500"}`}
                >
                  {user.isPhoneVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 block mb-1">
                Member Since
              </span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Last Login */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Last Login:</span>
              <span className="text-xs font-medium text-gray-900">
                {formatDate(user.lastLogin)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBasicInfo;
