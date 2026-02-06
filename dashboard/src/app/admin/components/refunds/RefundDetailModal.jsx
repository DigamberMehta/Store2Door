import React, { useState } from "react";
import {
  X,
  User,
  Store,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

const RefundDetailModal = ({ refund, onClose, onApprove, onReject }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approvalData, setApprovalData] = useState({
    approvedAmount: refund.requestedAmount,
    fromStore: 0,
    fromDriver: 0,
    fromPlatform: refund.requestedAmount,
    rationale: "",
    adminNote: "",
  });
  const [rejectionData, setRejectionData] = useState({
    rejectionReason: "",
    adminNote: "",
  });

  const canReview =
    refund.status === "pending_review" || refund.status === "under_review";

  // Auto-calculate platform amount when others change
  const handleAmountChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const newData = { ...approvalData, [field]: numValue };

    // Auto-adjust platform amount to make total = approved amount
    if (field !== "approvedAmount") {
      const totalOthers =
        (field !== "fromStore" ? newData.fromStore : 0) +
        (field !== "fromDriver" ? newData.fromDriver : 0);
      newData.fromPlatform = Math.max(
        0,
        newData.approvedAmount - totalOthers - numValue,
      );
    } else {
      // If approved amount changes, adjust platform to compensate
      newData.fromPlatform = Math.max(
        0,
        numValue - newData.fromStore - newData.fromDriver,
      );
    }

    setApprovalData(newData);
  };

  const handleApprove = async () => {
    // Validate
    const total =
      approvalData.fromStore +
      approvalData.fromDriver +
      approvalData.fromPlatform;
    if (Math.abs(total - approvalData.approvedAmount) > 0.01) {
      alert("Cost distribution must sum up to approved amount");
      return;
    }

    if (!approvalData.rationale) {
      alert("Please provide a rationale for the cost distribution");
      return;
    }

    await onApprove(refund._id, {
      approvedAmount: approvalData.approvedAmount,
      costDistribution: {
        fromStore: approvalData.fromStore,
        fromDriver: approvalData.fromDriver,
        fromPlatform: approvalData.fromPlatform,
        rationale: approvalData.rationale,
      },
      adminNote: approvalData.adminNote,
    });
  };

  const handleReject = async () => {
    if (!rejectionData.rejectionReason) {
      alert("Please provide a rejection reason");
      return;
    }

    await onReject(refund._id, rejectionData);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_review: "text-yellow-600 bg-yellow-100",
      under_review: "text-blue-600 bg-blue-100",
      approved: "text-green-600 bg-green-100",
      rejected: "text-red-600 bg-red-100",
      processing: "text-indigo-600 bg-indigo-100",
      completed: "text-green-600 bg-green-100",
      failed: "text-red-600 bg-red-100",
    };
    return colors[status] || "text-gray-600 bg-gray-100";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Refund Request Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">{refund.refundNumber}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(refund.status)}`}
            >
              {refund.status.replace(/_/g, " ").toUpperCase()}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  {refund.customerId?.profilePhoto ? (
                    <img
                      src={refund.customerId.profilePhoto}
                      alt=""
                      className="h-10 w-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {refund.customerId?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {refund.customerId?.email || ""}
                    </p>
                    <p className="text-xs text-gray-600">
                      {refund.customerId?.phone || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Order Information
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium text-gray-900">
                    {refund.orderId?.orderNumber ||
                      refund.orderSnapshot?.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Total:</span>
                  <span className="font-medium text-gray-900">
                    R{" "}
                    {(
                      refund.orderId?.total ||
                      refund.orderSnapshot?.orderTotal ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Status:</span>
                  <span className="font-medium text-gray-900">
                    {refund.orderId?.status ||
                      refund.orderSnapshot?.orderStatus ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Store:</span>
                  <span className="font-medium text-gray-900">
                    {refund.storeId?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Refund Request Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Requested Amount:</span>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  R {refund.requestedAmount.toFixed(2)}
                </p>
              </div>
              {refund.approvedAmount && (
                <div>
                  <span className="text-gray-600">Approved Amount:</span>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    R {refund.approvedAmount.toFixed(2)}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Reason:</span>
                <p className="font-medium text-gray-900 mt-1">
                  {refund.refundReason.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Submitted:</span>
                <p className="font-medium text-gray-900 mt-1">
                  {new Date(refund.createdAt).toLocaleString("en-ZA")}
                </p>
              </div>
            </div>

            {refund.customerNote && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <span className="text-xs font-medium text-gray-600">
                  Customer Note:
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {refund.customerNote}
                </p>
              </div>
            )}
          </div>

          {/* Evidence Files */}
          {refund.evidenceFiles && refund.evidenceFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Evidence Files
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {refund.evidenceFiles.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-200 rounded-lg p-2 hover:border-blue-500 transition-colors"
                  >
                    <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-2">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {file.filename || `File ${idx + 1}`}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin Decision Section */}
          {canReview && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Decision
              </h3>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setIsApproving(true);
                      setIsRejecting(false);
                    }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${
                      isApproving
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setIsRejecting(true);
                      setIsApproving(false);
                    }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${
                      isRejecting
                        ? "border-red-500 text-red-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <XCircle className="w-4 h-4 inline mr-2" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Approval Form */}
              {isApproving && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approved Amount (R)
                    </label>
                    <input
                      type="number"
                      value={approvalData.approvedAmount}
                      onChange={(e) =>
                        handleAmountChange("approvedAmount", e.target.value)
                      }
                      step="0.01"
                      min="0"
                      max={refund.requestedAmount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Cost Distribution
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          From Store (R)
                        </label>
                        <input
                          type="number"
                          value={approvalData.fromStore}
                          onChange={(e) =>
                            handleAmountChange("fromStore", e.target.value)
                          }
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          From Driver (R)
                        </label>
                        <input
                          type="number"
                          value={approvalData.fromDriver}
                          onChange={(e) =>
                            handleAmountChange("fromDriver", e.target.value)
                          }
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          From Platform (R)
                        </label>
                        <input
                          type="number"
                          value={approvalData.fromPlatform}
                          onChange={(e) =>
                            handleAmountChange("fromPlatform", e.target.value)
                          }
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 flex justify-between pt-2 border-t">
                      <span>Total:</span>
                      <span className="font-medium">
                        R{" "}
                        {(
                          approvalData.fromStore +
                          approvalData.fromDriver +
                          approvalData.fromPlatform
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rationale for Cost Distribution *
                    </label>
                    <textarea
                      value={approvalData.rationale}
                      onChange={(e) =>
                        setApprovalData({
                          ...approvalData,
                          rationale: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain why this cost distribution was chosen..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Note (optional)
                    </label>
                    <textarea
                      value={approvalData.adminNote}
                      onChange={(e) =>
                        setApprovalData({
                          ...approvalData,
                          adminNote: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes..."
                    />
                  </div>

                  <button
                    onClick={handleApprove}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Approve Refund & Credit Wallet
                  </button>
                </div>
              )}

              {/* Rejection Form */}
              {isRejecting && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionData.rejectionReason}
                      onChange={(e) =>
                        setRejectionData({
                          ...rejectionData,
                          rejectionReason: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain why this refund request is being rejected..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Note (optional)
                    </label>
                    <textarea
                      value={rejectionData.adminNote}
                      onChange={(e) =>
                        setRejectionData({
                          ...rejectionData,
                          adminNote: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes..."
                    />
                  </div>

                  <button
                    onClick={handleReject}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Refund Request
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Review Information (if already reviewed) */}
          {!canReview && (refund.reviewedBy || refund.rejectionReason) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reviewed By:</span>
                  <span className="font-medium text-gray-900">
                    {refund.reviewedBy?.name || "N/A"}
                  </span>
                </div>
                {refund.reviewedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reviewed At:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(refund.reviewedAt).toLocaleString("en-ZA")}
                    </span>
                  </div>
                )}
                {refund.costDistribution && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Cost Distribution:
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Store:</span>
                        <p className="font-medium">
                          R {refund.costDistribution.fromStore.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Driver:</span>
                        <p className="font-medium">
                          R {refund.costDistribution.fromDriver.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Platform:</span>
                        <p className="font-medium">
                          R {refund.costDistribution.fromPlatform.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {refund.costDistribution.rationale && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-600">
                          Rationale:
                        </span>
                        <p className="text-sm text-gray-900 mt-1">
                          {refund.costDistribution.rationale}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {refund.rejectionReason && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-xs font-medium text-gray-600">
                      Rejection Reason:
                    </span>
                    <p className="text-sm text-gray-900 mt-1">
                      {refund.rejectionReason}
                    </p>
                  </div>
                )}
                {refund.adminNote && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-xs font-medium text-gray-600">
                      Admin Note:
                    </span>
                    <p className="text-sm text-gray-900 mt-1">
                      {refund.adminNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundDetailModal;
