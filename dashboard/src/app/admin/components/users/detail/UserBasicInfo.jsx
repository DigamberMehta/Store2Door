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
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <div>
                <span className="text-xs text-gray-500">Email</span>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <div>
                <span className="text-xs text-gray-500">Phone</span>
                <p className="text-sm font-medium">{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              {user.isActive ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <div>
                <span className="text-xs text-gray-500">Account Status</span>
                <p
                  className={`text-sm font-medium ${user.isActive ? "text-green-600" : "text-red-600"}`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {user.isEmailVerified ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <div>
                <span className="text-xs text-gray-500">Email Verified</span>
                <p
                  className={`text-sm font-medium ${user.isEmailVerified ? "text-green-600" : "text-gray-500"}`}
                >
                  {user.isEmailVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {user.isPhoneVerified ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <div>
                <span className="text-xs text-gray-500">Phone Verified</span>
                <p
                  className={`text-sm font-medium ${user.isPhoneVerified ? "text-green-600" : "text-gray-500"}`}
                >
                  {user.isPhoneVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <span className="text-xs text-gray-500">Member Since</span>
                <p className="text-sm font-medium">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <div>
                <span className="text-xs text-gray-500">Last Login</span>
                <p className="text-sm font-medium">
                  {formatDate(user.lastLogin)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBasicInfo;
