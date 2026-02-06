import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const AdminDecisionSection = ({
  canReview,
  refund,
  isApproving,
  isRejecting,
  setIsApproving,
  setIsRejecting,
  approvalData,
  rejectionData,
  setApprovalData,
  setRejectionData,
  handleAmountChange,
  handleApprove,
  handleReject,
  maxFromStore,
  maxFromDriver,
}) => {
  // If not reviewable, show review information
  if (!canReview && (refund.reviewedBy || refund.rejectionReason)) {
    return (
      <div className="border-t-2 border-gray-300 pt-8 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
          <CheckCircle className="w-6 h-6 mr-3 text-blue-600" />
          Review Information
        </h3>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
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
          {refund.adminNote && (
            <div>
              <span className="text-sm text-gray-600 block mb-1">
                Admin Note:
              </span>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                {refund.adminNote}
              </p>
            </div>
          )}
          {refund.rejectionReason && (
            <div>
              <span className="text-sm text-gray-600 block mb-1">
                Rejection Reason:
              </span>
              <p className="text-sm text-red-900 bg-red-50 p-3 rounded border border-red-200">
                {refund.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If can review, show decision forms
  if (!canReview) return null;

  return (
    <div className="border-t-2 border-gray-300 pt-8 mt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <CheckCircle className="w-7 h-7 mr-3 text-green-600" />
        Admin Decision
      </h3>

      {/* Tabs */}
      <div className="border-b-2 border-gray-200 mb-6">
        <div className="flex space-x-6">
          <button
            onClick={() => {
              setIsApproving(true);
              setIsRejecting(false);
            }}
            className={`px-5 py-3 text-sm font-semibold border-b-3 transition-all ${
              isApproving
                ? "border-green-500 text-green-600 bg-green-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
            className={`px-5 py-3 text-sm font-semibold border-b-3 transition-all ${
              isRejecting
                ? "border-red-500 text-red-600 bg-red-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
          {/* Order Breakdown Info */}
          {(refund.orderSnapshot?.paymentSplit ||
            refund.orderId?.paymentSplit) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-blue-900">
                Original Order Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-blue-700">Store Amount:</span>
                  <span className="float-right font-semibold text-blue-900">
                    R{" "}
                    {(
                      refund.orderSnapshot?.paymentSplit?.storeAmount ||
                      refund.orderId?.paymentSplit?.storeAmount ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Delivery Fee:</span>
                  <span className="float-right font-semibold text-blue-900">
                    R{" "}
                    {(
                      refund.orderSnapshot?.deliveryFee ||
                      refund.orderId?.deliveryFee ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Platform Markup:</span>
                  <span className="float-right font-semibold text-blue-900">
                    R{" "}
                    {(
                      refund.orderSnapshot?.paymentSplit?.platformBreakdown
                        ?.totalMarkup ||
                      refund.orderId?.paymentSplit?.platformBreakdown
                        ?.totalMarkup ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Tip (to driver):</span>
                  <span className="float-right font-semibold text-blue-900">
                    R{" "}
                    {(
                      refund.orderSnapshot?.tip ||
                      refund.orderId?.tip ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
                {(refund.orderSnapshot?.discount || refund.orderId?.discount) >
                  0 && (
                  <div className="col-span-2">
                    <span className="text-blue-700">
                      Discount (absorbed by platform):
                    </span>
                    <span className="float-right font-semibold text-red-600">
                      -R{" "}
                      {(
                        refund.orderSnapshot?.discount ||
                        refund.orderId?.discount ||
                        0
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="col-span-2 pt-2 border-t border-blue-200">
                  <span className="text-blue-700 font-semibold">
                    Platform Total:
                  </span>
                  <span className="float-right font-bold text-blue-900">
                    R{" "}
                    {(
                      refund.orderSnapshot?.paymentSplit?.platformAmount ||
                      refund.orderId?.paymentSplit?.platformAmount ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Platform amount = Markup (
                {(
                  refund.orderSnapshot?.paymentSplit?.platformBreakdown
                    ?.totalMarkup ||
                  refund.orderId?.paymentSplit?.platformBreakdown
                    ?.totalMarkup ||
                  0
                ).toFixed(2)}
                ) - Discount (
                {(
                  refund.orderSnapshot?.discount ||
                  refund.orderId?.discount ||
                  0
                ).toFixed(2)}
                )
              </p>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
            <h4 className="text-base font-semibold text-gray-900">
              Cost Distribution (Who pays for refund)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From Store (R)
                  <span className="block text-[10px] font-normal text-gray-500">
                    Max: R {maxFromStore.toFixed(2)}
                  </span>
                </label>
                <input
                  type="number"
                  value={approvalData.fromStore}
                  onChange={(e) =>
                    handleAmountChange("fromStore", e.target.value)
                  }
                  step="0.01"
                  min="0"
                  max={maxFromStore}
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From Driver (R)
                  <span className="block text-[10px] font-normal text-gray-500">
                    Max: R {maxFromDriver.toFixed(2)}
                  </span>
                </label>
                <input
                  type="number"
                  value={approvalData.fromDriver}
                  onChange={(e) =>
                    handleAmountChange("fromDriver", e.target.value)
                  }
                  step="0.01"
                  min="0"
                  max={maxFromDriver}
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From Platform (R)
                  <span className="block text-[10px] font-normal text-gray-500">
                    No limit (platform absorbs)
                  </span>
                </label>
                <input
                  type="number"
                  value={approvalData.fromPlatform}
                  onChange={(e) =>
                    handleAmountChange("fromPlatform", e.target.value)
                  }
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1 bg-white p-3 rounded border border-gray-200">
              <p>
                <strong>From Store:</strong> Deduct from store's earnings (max:
                R {maxFromStore.toFixed(2)})
              </p>
              <p>
                <strong>From Driver:</strong> Deduct from driver's earnings
                (max: R {maxFromDriver.toFixed(2)})
              </p>
              <p>
                <strong>From Platform:</strong> Platform absorbs this as loss
                (no limit - useful when not deducting from store/driver)
              </p>
              <p className="text-amber-700 mt-2 pt-2 border-t border-gray-300">
                ⚠️ <strong>Note:</strong> Store and driver contributions cannot
                exceed their earned amounts.
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-green-900">
                  Total Refund Amount:
                </span>
                <span className="text-2xl font-bold text-green-700">
                  R{" "}
                  {(
                    approvalData.fromStore +
                    approvalData.fromDriver +
                    approvalData.fromPlatform
                  ).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-green-700 mt-2 space-y-0.5">
                <p>
                  Order total: R{" "}
                  {(
                    refund.orderId?.total ||
                    refund.orderSnapshot?.orderTotal ||
                    0
                  ).toFixed(2)}
                </p>
                <p>Max requested: R {refund.requestedAmount.toFixed(2)}</p>
              </div>
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
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Additional notes..."
            />
          </div>

          <button
            onClick={handleApprove}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
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
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
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
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Additional notes..."
            />
          </div>

          <button
            onClick={handleReject}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Reject Refund Request
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDecisionSection;
