const DocumentApprovalModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedDocument,
  action,
  rejectionReason,
  setRejectionReason,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {action === "approve" ? "Approve Document" : "Reject Document"}
        </h3>

        {selectedDocument?.data?.imageUrl && (
          <div className="mb-4 relative">
            <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
              <img
                src={selectedDocument.data.imageUrl}
                alt="Document"
                className="w-full h-48 object-contain rounded"
                loading="lazy"
              />
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">
          You are about to {action} the{" "}
          <strong>
            {selectedDocument?.type?.replace(/([A-Z])/g, " $1").trim()}
          </strong>{" "}
          document.
        </p>

        {action === "reject" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Please provide a reason for rejection..."
              required
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={
              loading || (action === "reject" && !rejectionReason.trim())
            }
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading
              ? "Processing..."
              : action === "approve"
                ? "Approve"
                : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentApprovalModal;
