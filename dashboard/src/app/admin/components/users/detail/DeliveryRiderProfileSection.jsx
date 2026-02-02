import {
  Bike,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";

const DeliveryRiderProfileSection = ({ profile }) => {
  if (!profile) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rider Profile
        </h2>
        <p className="text-gray-500">No profile data available</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Verified",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertCircle,
        text: "Pending",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Rejected",
      },
      not_uploaded: {
        color: "bg-gray-100 text-gray-800",
        icon: XCircle,
        text: "Not Uploaded",
      },
    };

    const config = statusConfig[status] || statusConfig.not_uploaded;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Vehicle Information */}
      {profile.vehicle && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bike className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">
              Vehicle Information
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-gray-500">Vehicle Type</span>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {profile.vehicle.type?.replace("_", " ") || "N/A"}
              </p>
            </div>
            {profile.vehicle.make && (
              <div>
                <span className="text-xs text-gray-500">Make & Model</span>
                <p className="text-sm font-medium text-gray-900">
                  {profile.vehicle.make} {profile.vehicle.model}
                </p>
              </div>
            )}
            {profile.vehicle.year && (
              <div>
                <span className="text-sm text-gray-500">Year</span>
                <p className="font-medium text-gray-900">
                  {profile.vehicle.year}
                </p>
              </div>
            )}
            {profile.vehicle.color && (
              <div>
                <span className="text-sm text-gray-500">Color</span>
                <p className="font-medium text-gray-900 capitalize">
                  {profile.vehicle.color}
                </p>
              </div>
            )}
            {profile.vehicle.licensePlate && (
              <div>
                <span className="text-sm text-gray-500">License Plate</span>
                <p className="font-medium text-gray-900">
                  {profile.vehicle.licensePlate}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents */}
      {profile.documents && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">Documents</h2>
          </div>
          <div className="space-y-3">
            {/* Profile Photo */}
            {profile.documents.profilePhoto && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {profile.documents.profilePhoto.imageUrl && (
                    <img
                      src={profile.documents.profilePhoto.imageUrl}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Profile Photo
                    </p>
                    {profile.documents.profilePhoto.uploadedAt && (
                      <p className="text-xs text-gray-500">
                        Uploaded:{" "}
                        {formatDate(profile.documents.profilePhoto.uploadedAt)}
                      </p>
                    )}
                  </div>
                </div>
                {getStatusBadge(profile.documents.profilePhoto.status)}
              </div>
            )}

            {/* ID Document */}
            {profile.documents.idDocument && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ID Document
                  </p>
                  {profile.documents.idDocument.number && (
                    <p className="text-xs text-gray-500">
                      ID: {profile.documents.idDocument.number}
                    </p>
                  )}
                  {profile.documents.idDocument.uploadedAt && (
                    <p className="text-sm text-gray-500">
                      Uploaded:{" "}
                      {formatDate(profile.documents.idDocument.uploadedAt)}
                    </p>
                  )}
                </div>
                {getStatusBadge(profile.documents.idDocument.status)}
              </div>
            )}

            {/* Driver's License */}
            {profile.documents.driversLicence && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Driver's License</p>
                  {profile.documents.driversLicence.number && (
                    <p className="text-sm text-gray-500">
                      License: {profile.documents.driversLicence.number}
                    </p>
                  )}
                  {profile.documents.driversLicence.expiryDate && (
                    <p className="text-sm text-gray-500">
                      Expires:{" "}
                      {formatDate(profile.documents.driversLicence.expiryDate)}
                    </p>
                  )}
                </div>
                {getStatusBadge(profile.documents.driversLicence.status)}
              </div>
            )}

            {/* Vehicle Photo */}
            {profile.documents.vehiclePhoto && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Vehicle Photo</p>
                  {profile.documents.vehiclePhoto.uploadedAt && (
                    <p className="text-sm text-gray-500">
                      Uploaded:{" "}
                      {formatDate(profile.documents.vehiclePhoto.uploadedAt)}
                    </p>
                  )}
                </div>
                {getStatusBadge(profile.documents.vehiclePhoto.status)}
              </div>
            )}

            {/* Work Permit */}
            {profile.documents.workPermit && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Work Permit</p>
                  {profile.documents.workPermit.number && (
                    <p className="text-sm text-gray-500">
                      Permit: {profile.documents.workPermit.number}
                    </p>
                  )}
                  {profile.documents.workPermit.expiryDate && (
                    <p className="text-sm text-gray-500">
                      Expires:{" "}
                      {formatDate(profile.documents.workPermit.expiryDate)}
                    </p>
                  )}
                </div>
                {getStatusBadge(profile.documents.workPermit.status)}
              </div>
            )}

            {/* Banking Details */}
            {profile.documents.proofOfBankingDetails && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Proof of Banking Details
                  </p>
                  {profile.documents.proofOfBankingDetails.uploadedAt && (
                    <p className="text-sm text-gray-500">
                      Uploaded:{" "}
                      {formatDate(
                        profile.documents.proofOfBankingDetails.uploadedAt,
                      )}
                    </p>
                  )}
                </div>
                {getStatusBadge(profile.documents.proofOfBankingDetails.status)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Availability Status */}
      {profile.availability && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Availability
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-sm text-gray-500">Current Status</span>
              <p className="font-medium text-gray-900 capitalize">
                {profile.availability.status || "N/A"}
              </p>
            </div>
            {profile.availability.isOnline !== undefined && (
              <div>
                <span className="text-sm text-gray-500">Online Status</span>
                <p
                  className={`font-medium ${profile.availability.isOnline ? "text-green-600" : "text-gray-500"}`}
                >
                  {profile.availability.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryRiderProfileSection;
