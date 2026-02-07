import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, AlertCircle, Upload, DollarSign } from "lucide-react";
import { submitRefund } from "../services/api/refund.api";
import { uploadImage } from "../services/upload";
import { toast } from "react-hot-toast";

const RequestRefundModal = ({ order, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    refundReason: "",
    customerNote: "",
    evidenceFiles: [],
  });

  const refundReasons = [
    { value: "not_delivered", label: "Order Was Not Delivered" },
    { value: "delivered_wrong_items", label: "Received Wrong Items" },
    { value: "delivered_damaged_items", label: "Items Were Damaged" },
    { value: "delivered_incomplete_order", label: "Order Was Incomplete" },
    { value: "quality_issue", label: "Quality Issue" },
    { value: "late_delivery", label: "Delivery Was Too Late" },
    { value: "delivery_mishap", label: "Delivery Problem" },
    { value: "other", label: "Other Reason" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.refundReason) {
      toast.error("Please select a reason for the refund");
      return;
    }

    try {
      setLoading(true);
      const response = await submitRefund({
        orderId: order._id,
        refundReason: formData.refundReason,
        customerNote: formData.customerNote,
        evidenceFiles: formData.evidenceFiles,
      });

      if (response.success) {
        toast.success("Refund request submitted successfully");
        onSuccess?.();
        onClose();
        navigate("/profile/refunds");
      }
    } catch (error) {
      console.error("Error submitting refund:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit refund request",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    try {
      toast.loading("Uploading files...", { id: "file-upload" });

      // Upload files to server
      const uploadPromises = files.map((file) => uploadImage(file));
      const urls = await Promise.all(uploadPromises);

      // Create file objects with uploaded URLs
      const fileObjs = urls.map((url, index) => ({
        type: "image",
        url: url,
        filename: files[index].name,
      }));

      setFormData({
        ...formData,
        evidenceFiles: [...formData.evidenceFiles, ...fileObjs],
      });

      toast.success("Files uploaded successfully", { id: "file-upload" });
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload files", { id: "file-upload" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[#0a0a0a] w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl border border-white/10 max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Request Refund</h2>
            <p className="text-xs sm:text-sm text-white/50 mt-0.5 sm:mt-1">
              Order #{order?.orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Info Alert */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4 flex gap-2 sm:gap-3">
            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-blue-400 font-medium">
                Refund Process
              </p>
              <p className="text-xs text-blue-300/70 mt-0.5 sm:mt-1">
                Your request will be reviewed by our team. The admin will
                determine the final refund amount based on your issue. If
                approved, the amount will be credited to your wallet within 24
                hours.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm text-white/50">Order Total:</span>
              <span className="text-base sm:text-lg font-bold text-white">
                R {order?.total?.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-white/30">
              {order?.items?.length || 0} items •{" "}
              {new Date(order?.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Refund Amount - Display Only */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1.5 sm:mb-2">
              Order Amount
            </label>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs sm:text-sm">Full Order Total:</span>
                <span className="text-xl sm:text-2xl font-bold text-green-400">
                  R {order?.total?.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-white/30 mt-0.5 sm:mt-1">
              Admin will determine the final refund amount after review
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1.5 sm:mb-2">
              Reason for Refund *
            </label>
            <select
              value={formData.refundReason}
              onChange={(e) =>
                setFormData({ ...formData, refundReason: e.target.value })
              }
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
            >
              <option value="" className="bg-[#0a0a0a]">
                Select a reason
              </option>
              {refundReasons.map((reason) => (
                <option
                  key={reason.value}
                  value={reason.value}
                  className="bg-[#0a0a0a]"
                >
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1.5 sm:mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={formData.customerNote}
              onChange={(e) =>
                setFormData({ ...formData, customerNote: e.target.value })
              }
              rows={3}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1.5 sm:mb-2">
              Upload Evidence (Optional)
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 sm:p-6 text-center hover:border-white/20 transition-colors">
              <input
                type="file"
                id="evidence-upload"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="evidence-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-white/30 mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-white/50">
                  Upload photos of the issue
                </p>
                <p className="text-xs text-white/30 mt-0.5 sm:mt-1">
                  PNG, JPG up to 10MB each
                </p>
              </label>
            </div>
            {formData.evidenceFiles.length > 0 && (
              <div className="mt-2 sm:mt-3 flex flex-wrap gap-2">
                {formData.evidenceFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white/5 border border-white/10 rounded-lg p-1.5 sm:p-2 text-xs text-white/70"
                  >
                    <span className="truncate max-w-[100px] inline-block">{file.filename}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          evidenceFiles: formData.evidenceFiles.filter(
                            (_, i) => i !== idx,
                          ),
                        })
                      }
                      className="ml-1 text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 sm:py-3 text-sm sm:text-base bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestRefundModal;
