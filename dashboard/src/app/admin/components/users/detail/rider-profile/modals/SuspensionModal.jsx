const SuspensionModal = ({
  isOpen,
  onClose,
  onConfirm,
  suspensionReason,
  setSuspensionReason,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Suspend Rider
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Please provide a reason for suspending this rider:
        </p>
        <textarea
          value={suspensionReason}
          onChange={(e) => setSuspensionReason(e.target.value)}
          placeholder="Enter suspension reason..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          rows={4}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Suspend
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspensionModal;
