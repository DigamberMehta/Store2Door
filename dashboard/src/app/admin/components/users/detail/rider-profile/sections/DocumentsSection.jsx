import { FileText } from "lucide-react";
import DocumentCard from "../documents/DocumentCard";

const DocumentsSection = ({
  profile,
  onDocumentAction,
  onPreviewDocument,
  formatDate,
  getStatusBadge,
}) => {
  if (!profile.documents) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900">
          Documents Verification
        </h2>
      </div>

      {/* Identity Documents */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-500 rounded"></div>
          Identity & Personal Documents
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <DocumentCard
            title="Profile Photo"
            document={profile.documents.profilePhoto}
            documentType="profilePhoto"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
          <DocumentCard
            title="ID Document"
            document={profile.documents.idDocument}
            documentType="idDocument"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
          <DocumentCard
            title="Work Permit"
            document={profile.documents.workPermit}
            documentType="workPermit"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
          <DocumentCard
            title="Proof of Address"
            document={profile.documents.proofOfAddress}
            documentType="proofOfAddress"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        </div>
      </div>

      {/* Vehicle Documents */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-green-500 rounded"></div>
          Vehicle Documents
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <DocumentCard
            title="Driver's License"
            document={profile.documents.driversLicence}
            documentType="driversLicence"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
          <DocumentCard
            title="Vehicle Photo"
            document={profile.documents.vehiclePhoto}
            documentType="vehiclePhoto"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
          <DocumentCard
            title="Vehicle License"
            document={profile.documents.vehicleLicense}
            documentType="vehicleLicense"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
          <DocumentCard
            title="Vehicle Assessment"
            document={profile.documents.vehicleAssessment}
            documentType="vehicleAssessment"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        </div>
      </div>

      {/* Financial & Legal Documents */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-purple-500 rounded"></div>
          Financial & Legal Documents
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <DocumentCard
            title="Proof of Banking Details"
            document={profile.documents.proofOfBankingDetails}
            documentType="proofOfBankingDetails"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
          <DocumentCard
            title="Carrier Agreement"
            document={profile.documents.carrierAgreement}
            documentType="carrierAgreement"
            onDocumentAction={onDocumentAction}
            onPreviewDocument={onPreviewDocument}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
