import { Eye, Check, X } from "lucide-react";

const DocumentCard = ({
  title,
  document,
  documentType,
  onDocumentAction,
  onPreviewDocument,
  formatDate,
  getStatusBadge,
}) => {
  if (!document) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {document.imageUrl && (
            <button
              onClick={() => onPreviewDocument(document, title)}
              className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
              title="Preview document"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
        {document.number && (
          <p className="text-xs text-gray-500 mt-0.5">
            Number: {document.number}
          </p>
        )}
        {document.uploadedAt && (
          <p className="text-xs text-gray-500 mt-0.5">
            Uploaded: {formatDate(document.uploadedAt)}
          </p>
        )}
        {document.status === "rejected" && document.rejectionReason && (
          <p className="text-xs text-red-600 mt-1">
            Reason: {document.rejectionReason}
          </p>
        )}
        {document.expiryDate && (
          <p className="text-xs text-gray-500 mt-0.5">
            Expires: {formatDate(document.expiryDate)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge(document.status)}
        {document.status === "pending" && document.imageUrl && (
          <div className="flex gap-1">
            <button
              onClick={() =>
                onDocumentAction(documentType, document, "approve")
              }
              className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
              title="Approve document"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDocumentAction(documentType, document, "reject")}
              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
              title="Reject document"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
