import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driverProfileAPI } from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  FileText,
  ShieldCheck,
  CreditCard,
  Car,
  User,
  Home,
  FileCheck,
  Clock,
  AlertCircle,
  XCircle,
  Camera,
} from "lucide-react";
import DocumentUploadModal from "./DocumentUploadModal";

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(null);
  const [documentsStatus, setDocumentsStatus] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [isNotSACitizen, setIsNotSACitizen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch documents status from API
  useEffect(() => {
    fetchDocumentsStatus();
  }, []);

  const fetchDocumentsStatus = async () => {
    try {
      setLoading(true);
      const response = await driverProfileAPI.getDocumentsStatus();
      setDocumentsStatus(response.data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      // Fallback to mock data on error
      setDocumentsStatus({
        profilePhoto: {
          uploaded: true,
          status: "verified",
          canReupload: false,
        },
        vehiclePhoto: {
          uploaded: true,
          status: "verified",
          canReupload: false,
        },
        idDocument: { uploaded: true, status: "verified", canReupload: false },
        driversLicence: {
          uploaded: true,
          status: "pending",
          canReupload: true,
        },
        proofOfBankingDetails: {
          uploaded: true,
          status: "verified",
          canReupload: false,
        },
        proofOfAddress: {
          uploaded: true,
          status: "verified",
          canReupload: false,
        },
        vehicleLicense: {
          uploaded: true,
          status: "verified",
          canReupload: false,
        },
        thirdPartyInsurance: {
          uploaded: false,
          status: "not_uploaded",
          canReupload: true,
        },
        vehicleAssessment: {
          uploaded: true,
          status: "verified",
          canReupload: false,
        },
        carrierAgreement: {
          uploaded: false,
          status: "not_uploaded",
          canReupload: true,
        },
        workPermit: {
          uploaded: false,
          status: "not_uploaded",
          canReupload: true,
          rejectionReason: null,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const documentList = [
    {
      id: "vehiclePhoto",
      title: "Vehicle Photo",
      description: "(photo)",
      icon: Camera,
      required: true,
    },
    {
      id: "idDocument",
      title: "ID Document",
      description: "(photo/pdf)",
      icon: CreditCard,
      required: true,
    },
    {
      id: "workPermit",
      title: "Asylum Seeker/Work Permit/Visa/Right...",
      description: "(photo/pdf)",
      icon: FileCheck,
      required: isNotSACitizen,
      conditional: true,
    },
    {
      id: "driversLicence",
      title: "Drivers Licence",
      description: "(photo/pdf)",
      icon: FileText,
      required: true,
    },
    {
      id: "proofOfBankingDetails",
      title: "Proof Of Banking Details",
      description: "(photo/pdf)",
      icon: CreditCard,
      required: true,
    },
    {
      id: "proofOfAddress",
      title: "Proof Of Address",
      description: "(photo/pdf)",
      icon: Home,
      required: true,
    },
    {
      id: "vehicleLicense",
      title: "Vehicle License",
      description: "(photo/pdf)",
      icon: Car,
      required: true,
    },
    {
      id: "vehicleAssessment",
      title: "Vehicle Assessment",
      description: "(photo/pdf)",
      icon: FileCheck,
      required: true,
    },
    {
      id: "carrierAgreement",
      title: "Carrier Agreement",
      description: "(photo/pdf)",
      icon: FileText,
      required: true,
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "verified":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "not_uploaded":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "not_uploaded":
        return <Upload className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "verified":
        return "Uploaded";
      case "pending":
        return "Uploaded";
      case "rejected":
        return "Nothing uploaded yet";
      case "not_uploaded":
        return "Nothing uploaded yet";
      default:
        return "";
    }
  };

  const handleUpload = async (docId) => {
    const docStatus = documentsStatus[docId];

    // Only allow upload when status is "not_uploaded" or "rejected"
    if (
      docStatus &&
      docStatus.status !== "not_uploaded" &&
      docStatus.status !== "rejected"
    ) {
      if (docStatus.status === "pending") {
        toast.error(
          "Your document is pending review by admin. Please wait for approval.",
          {
            duration: 4000,
          },
        );
      } else if (docStatus.status === "verified") {
        toast.error(
          "This document is already verified. Contact admin if you need to update it.",
          {
            duration: 4000,
          },
        );
      }
      return;
    }

    setSelectedDocumentType(docId);
    setShowUploadModal(true);
  };

  const handleDocumentUpload = async (docId, file, additionalData) => {
    setUploading(docId);

    try {
      // Upload to server with Cloudinary
      await driverProfileAPI.uploadDocument(docId, file, additionalData);

      // Refresh document status
      await fetchDocumentsStatus();
      toast.success("Document uploaded successfully!", {
        duration: 3000,
      });
      setShowUploadModal(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.message || "Failed to upload document. Please try again.",
        {
          duration: 4000,
        },
      );
    } finally {
      setUploading(null);
    }
  };

  const calculateVerificationPercentage = () => {
    const requiredDocs = documentList.filter(
      (doc) =>
        doc.required &&
        (!doc.conditional || (doc.conditional && isNotSACitizen)),
    );
    const verifiedDocs = requiredDocs.filter(
      (doc) => documentsStatus[doc.id]?.status === "verified",
    );
    return Math.round((verifiedDocs.length / requiredDocs.length) * 100) || 0;
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        show={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedDocumentType(null);
        }}
        documentType={selectedDocumentType}
        onUpload={handleDocumentUpload}
        uploading={uploading === selectedDocumentType}
      />

      {/* Header */}
      <div className="pt-8 px-4 pb-4 bg-zinc-900/50 backdrop-blur-xl border-b border-white/5 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="bg-white/5 p-1.5 rounded-full border border-white/5 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div>
          <p className="text-lg font-bold">Profile</p>
          <p className="text-[10px] text-zinc-500 font-medium">
            Verify your identity and vehicle
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress Alert */}
        <div className="bg-blue-300/10 border border-blue-300/20 rounded-2xl p-3 flex gap-4">
          <div className="bg-blue-300/20 p-2 rounded-xl h-fit">
            <ShieldCheck className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <p className="font-bold text-xs">
              Verification Status: {calculateVerificationPercentage()}%
            </p>
            <p className="text-[10px] text-zinc-400 mt-1">
              {calculateVerificationPercentage() === 100
                ? "All documents verified! You can start accepting orders."
                : "Submit and verify all documents to start accepting orders."}
            </p>
          </div>
        </div>

        {/* Non-SA Citizen Checkbox */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isNotSACitizen}
              onChange={(e) => setIsNotSACitizen(e.target.checked)}
              className="w-5 h-5 rounded accent-blue-300"
            />
            <span className="text-sm font-medium">
              I am not a South African citizen
            </span>
          </label>
        </div>

        {/* Doc List */}
        <div className="space-y-2">
          {documentList.map((doc) => {
            // Skip work permit if SA citizen
            if (doc.conditional && !isNotSACitizen) return null;

            const docStatus = documentsStatus[doc.id] || {
              status: "not_uploaded",
              canReupload: true,
            };
            const showRejectionReason =
              docStatus.status === "rejected" && docStatus.rejectionReason;

            // Only allow upload when status is "not_uploaded" or "rejected" (admin asked to reupload)
            const canUpload =
              docStatus.status === "not_uploaded" ||
              docStatus.status === "rejected";

            return (
              <div key={doc.id} className="space-y-2">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        docStatus.status === "verified"
                          ? "bg-emerald-500/20"
                          : docStatus.status === "rejected"
                            ? "bg-red-500/20"
                            : docStatus.status === "pending"
                              ? "bg-amber-500/20"
                              : "bg-white/5"
                      }`}
                    >
                      <doc.icon
                        className={`w-5 h-5 ${
                          docStatus.status === "verified"
                            ? "text-emerald-400"
                            : docStatus.status === "rejected"
                              ? "text-red-400"
                              : docStatus.status === "pending"
                                ? "text-amber-400"
                                : "text-zinc-400"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs">{doc.title}</h3>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        {doc.description}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {getStatusText(docStatus.status)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUpload(doc.id)}
                      disabled={uploading === doc.id || !canUpload}
                      className={`p-2 rounded-xl shrink-0 transition-all active:scale-90 ${
                        uploading === doc.id
                          ? "bg-blue-300/20 border border-blue-300/30"
                          : !canUpload
                            ? "bg-zinc-800 border border-zinc-700 opacity-50 cursor-not-allowed"
                            : docStatus.status === "rejected"
                              ? "bg-red-500 border border-red-500 shadow-lg shadow-red-500/20"
                              : "bg-blue-300 text-black border border-blue-300 shadow-lg shadow-blue-300/10"
                      }`}
                    >
                      {uploading === doc.id ? (
                        <div className="w-4 h-4 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin" />
                      ) : (
                        getStatusIcon(docStatus.status)
                      )}
                    </button>
                  </div>
                </div>

                {/* Rejection Reason */}
                {showRejectionReason && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 ml-2">
                    <p className="text-[10px] text-red-400 font-medium">
                      <span className="font-bold">Admin Note: </span>
                      {docStatus.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Guidelines */}
        <div className="mt-6">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 mb-3">
            Guidelines
          </h2>
          <div className="space-y-2">
            {[
              "Ensure documents are original and valid",
              "Photos should be clear with all text readable",
              "File size should be under 5MB (JPG, PNG, PDF)",
              "Verification process takes 24-48 hours",
              "You can re-upload if document is rejected",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-300 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Support */}
      <div className="mt-auto p-4 pb-8 text-center">
        <p className="text-[10px] text-zinc-500">
          Need help with document submission?
        </p>
        <button className="text-blue-300 font-bold text-xs mt-1">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default DocumentsPage;
