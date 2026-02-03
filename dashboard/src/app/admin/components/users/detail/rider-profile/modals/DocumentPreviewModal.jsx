import { X, ZoomIn, Download } from "lucide-react";
import { toast } from "react-hot-toast";

const DocumentPreviewModal = ({
  isOpen,
  onClose,
  previewDocument,
  imageLoading,
  setImageLoading,
  formatDate,
  getStatusBadge,
}) => {
  if (!isOpen || !previewDocument) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {previewDocument.title}
            </h3>
            {previewDocument.data.number && (
              <p className="text-sm text-gray-500 mt-0.5">
                Document #: {previewDocument.data.number}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={previewDocument.data.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ZoomIn className="w-5 h-5" />
            </a>
            <a
              href={previewDocument.data.imageUrl}
              download
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download document"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50 relative">
          {/* Shimmer Loading Effect */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="w-full max-w-2xl mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"
                style={{ height: "calc(90vh - 180px)" }}
              >
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500 font-medium">
                    Loading document...
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Image */}
          <img
            src={previewDocument.data.imageUrl}
            alt={previewDocument.title}
            className={`w-full h-auto object-contain mx-auto transition-opacity duration-500 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            style={{ maxHeight: "calc(90vh - 180px)" }}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              toast.error("Failed to load document image");
            }}
          />
        </div>

        {/* Footer with document info and actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {previewDocument.data.uploadedAt && (
                <p>Uploaded: {formatDate(previewDocument.data.uploadedAt)}</p>
              )}
              {previewDocument.data.status && (
                <div className="mt-2">
                  {getStatusBadge(previewDocument.data.status)}
                </div>
              )}
              {previewDocument.data.rejectionReason && (
                <p className="text-red-600 mt-2">
                  Rejection Reason: {previewDocument.data.rejectionReason}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
