import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { userAPI } from "../../../../../../services/admin/api";

// Section Components
import {
  AccountStatusSection,
  ActivityInformationSection,
  VehicleDetailsSection,
  BankDetailsSection,
  DocumentsSection,
} from "./sections";

// Modal Components
import {
  SuspensionModal,
  VehicleEditModal,
  BankDetailsEditModal,
  DocumentPreviewModal,
  DocumentApprovalModal,
} from "./modals";

const DeliveryRiderProfileSection = ({
  profile: initialProfile,
  userId,
  onDocumentUpdate,
  onProfileUpdate,
}) => {
  // Document-related state
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Local profile state to avoid full page re-render
  const [profile, setProfile] = useState(initialProfile);

  // Edit modals state
  const [showVehicleEditModal, setShowVehicleEditModal] = useState(false);
  const [showBankEditModal, setShowBankEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [vehicleData, setVehicleData] = useState(profile?.vehicle || {});
  const [bankData, setBankData] = useState(profile?.bankDetails || {});
  const [suspensionReason, setSuspensionReason] = useState("");

  // Sync with parent profile when it changes (e.g., after document approval)
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

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

  // Helper functions
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

  // Document handlers
  const handleDocumentAction = (documentType, documentData, actionType) => {
    setSelectedDocument({ type: documentType, data: documentData });
    setAction(actionType);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    try {
      if (onDocumentUpdate) {
        await onDocumentUpdate(
          userId,
          selectedDocument.type,
          action,
          rejectionReason,
        );
      }
      setShowModal(false);
      setRejectionReason("");
      setSelectedDocument(null);
      setAction(null);
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document status");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocument = (documentData, title) => {
    setImageLoading(true);
    setPreviewDocument({ data: documentData, title });
    setShowPreviewModal(true);
  };

  // Toggle status handlers
  const handleToggleStatus = async (statusType, currentValue) => {
    if (statusType === "isSuspended" && !currentValue) {
      // Show suspension modal when suspending
      setShowSuspendModal(true);
      return;
    }

    // Optimistic update
    const newValue = !currentValue;
    setProfile((prev) => ({
      ...prev,
      [statusType]: newValue,
      ...(statusType === "isSuspended" && newValue === false
        ? { suspensionReason: null }
        : {}),
    }));

    try {
      const response = await userAPI.toggleRiderStatus(
        userId,
        statusType,
        newValue,
      );
      if (response.success) {
        toast.success("Status updated successfully");
        // Update with server response
        if (response.data?.profile) {
          setProfile(response.data.profile);
        }
      }
    } catch (error) {
      // Revert on error
      setProfile((prev) => ({
        ...prev,
        [statusType]: currentValue,
      }));
      console.error("Error toggling status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleSuspend = async () => {
    if (!suspensionReason.trim()) {
      toast.error("Please provide a suspension reason");
      return;
    }

    // Optimistic update
    setProfile((prev) => ({
      ...prev,
      isSuspended: true,
      suspensionReason: suspensionReason,
      isAvailable: false,
    }));
    setShowSuspendModal(false);

    try {
      const response = await userAPI.toggleRiderStatus(
        userId,
        "isSuspended",
        true,
        suspensionReason,
      );
      if (response.success) {
        toast.success("Rider suspended successfully");
        setSuspensionReason("");
        // Update with server response
        if (response.data?.profile) {
          setProfile(response.data.profile);
        }
      }
    } catch (error) {
      // Revert on error
      setProfile((prev) => ({
        ...prev,
        isSuspended: false,
        suspensionReason: null,
      }));
      console.error("Error suspending rider:", error);
      toast.error(error.response?.data?.message || "Failed to suspend rider");
    }
  };

  // Edit handlers
  const handleUpdateVehicle = async () => {
    try {
      setLoading(true);
      const response = await userAPI.updateRiderVehicle(userId, vehicleData);
      if (response.success) {
        toast.success("Vehicle information updated successfully");
        setShowVehicleEditModal(false);
        // Update local state
        setProfile((prev) => ({
          ...prev,
          vehicle: response.data?.vehicle || vehicleData,
        }));
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error(error.response?.data?.message || "Failed to update vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBankDetails = async () => {
    try {
      setLoading(true);
      const response = await userAPI.updateRiderBankDetails(userId, bankData);
      if (response.success) {
        toast.success("Bank details updated successfully");
        setShowBankEditModal(false);
        // Update local state
        setProfile((prev) => ({
          ...prev,
          bankDetails: response.data?.bankDetails || bankData,
        }));
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error(
        error.response?.data?.message || "Failed to update bank details",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <AccountStatusSection
          profile={profile}
          onToggleStatus={handleToggleStatus}
          formatDate={formatDate}
        />

        <ActivityInformationSection
          profile={profile}
          onToggleStatus={handleToggleStatus}
          formatDate={formatDate}
        />

        <BankDetailsSection
          profile={profile}
          onEditClick={() => {
            setBankData(profile.bankDetails);
            setShowBankEditModal(true);
          }}
        />

        <VehicleDetailsSection
          profile={profile}
          onEditClick={() => {
            setVehicleData(profile.vehicle);
            setShowVehicleEditModal(true);
          }}
        />

        <DocumentsSection
          profile={profile}
          onDocumentAction={handleDocumentAction}
          onPreviewDocument={handlePreviewDocument}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
        />
      </div>

      {/* Modals */}
      <SuspensionModal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSuspensionReason("");
        }}
        onConfirm={handleSuspend}
        suspensionReason={suspensionReason}
        setSuspensionReason={setSuspensionReason}
      />

      <VehicleEditModal
        isOpen={showVehicleEditModal}
        onClose={() => setShowVehicleEditModal(false)}
        onSave={handleUpdateVehicle}
        vehicleData={vehicleData}
        setVehicleData={setVehicleData}
        loading={loading}
      />

      <BankDetailsEditModal
        isOpen={showBankEditModal}
        onClose={() => setShowBankEditModal(false)}
        onSave={handleUpdateBankDetails}
        bankData={bankData}
        setBankData={setBankData}
        loading={loading}
      />

      <DocumentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewDocument(null);
        }}
        previewDocument={previewDocument}
        imageLoading={imageLoading}
        setImageLoading={setImageLoading}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
      />

      <DocumentApprovalModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setRejectionReason("");
          setSelectedDocument(null);
          setAction(null);
        }}
        onConfirm={handleConfirmAction}
        selectedDocument={selectedDocument}
        action={action}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        loading={loading}
      />
    </>
  );
};

export default DeliveryRiderProfileSection;
