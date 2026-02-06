import React, { useState } from "react";
import { X } from "lucide-react";

// Import modular components
import CustomerInfoCard from "./detail/CustomerInfoCard";
import OrderInfoCard from "./detail/OrderInfoCard";
import RefundDetailsCard from "./detail/RefundDetailsCard";
import EvidenceFilesCard from "./detail/EvidenceFilesCard";
import PaymentInfoCard from "./detail/PaymentInfoCard";
import OrderItemsCard from "./detail/OrderItemsCard";
import DeliveryAddressCard from "./detail/DeliveryAddressCard";
import PaymentSplitCard from "./detail/PaymentSplitCard";
import RiderInfoCard from "./detail/RiderInfoCard";
import StoreDetailsCard from "./detail/StoreDetailsCard";
import OrderTimelineCard from "./detail/OrderTimelineCard";
import AdminDecisionSection from "./detail/AdminDecisionSection";

const RefundDetailModal = ({ refund, onClose, onApprove, onReject }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approvalData, setApprovalData] = useState({
    fromStore: 0,
    fromDriver: 0,
    fromPlatform: 0,
    rationale: "",
    adminNote: "",
  });
  const [rejectionData, setRejectionData] = useState({
    rejectionReason: "",
    adminNote: "",
  });

  const canReview =
    refund.status === "pending_review" || refund.status === "under_review";

  // Calculate max limits for validation
  const maxFromStore =
    refund.orderSnapshot?.paymentSplit?.storeAmount ||
    refund.orderId?.paymentSplit?.storeAmount ||
    0;
  const maxFromDriver =
    (refund.orderSnapshot?.deliveryFee || refund.orderId?.deliveryFee || 0) +
    (refund.orderSnapshot?.tip || refund.orderId?.tip || 0);

  // Handle amount changes with validation
  const handleAmountChange = (field, value) => {
    const numValue = parseFloat(value) || 0;

    // Validate based on field
    if (field === "fromStore" && numValue > maxFromStore) {
      alert(
        `Store contribution cannot exceed R ${maxFromStore.toFixed(2)} (their earned amount)`,
      );
      return;
    }

    if (field === "fromDriver" && numValue > maxFromDriver) {
      alert(
        `Driver contribution cannot exceed R ${maxFromDriver.toFixed(2)} (delivery fee + tip)`,
      );
      return;
    }

    setApprovalData({
      ...approvalData,
      [field]: numValue,
    });
  };

  const handleApprove = async () => {
    // Calculate approved amount from distribution
    const approvedAmount =
      approvalData.fromStore +
      approvalData.fromDriver +
      approvalData.fromPlatform;

    // Get order total
    const orderTotal =
      refund.orderId?.total || refund.orderSnapshot?.orderTotal || 0;

    // Validate
    if (approvedAmount <= 0) {
      alert("Total refund amount must be greater than 0");
      return;
    }

    if (approvedAmount > orderTotal) {
      alert(
        `Total refund amount (R ${approvedAmount.toFixed(2)}) cannot exceed order total (R ${orderTotal.toFixed(2)})`,
      );
      return;
    }

    if (approvedAmount > refund.requestedAmount) {
      alert(
        `Total refund amount (R ${approvedAmount.toFixed(2)}) cannot exceed requested amount (R ${refund.requestedAmount.toFixed(2)})`,
      );
      return;
    }

    if (!approvalData.rationale) {
      alert("Please provide a rationale for the cost distribution");
      return;
    }

    await onApprove(refund._id, {
      approvedAmount,
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-8 py-5 flex items-center justify-between rounded-t-2xl backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Refund Request Details
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {refund.refundNumber}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(refund.status)}`}
            >
              {refund.status.replace(/_/g, " ").toUpperCase()}
            </span>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50/50 to-white">
          {/* Customer & Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomerInfoCard customer={refund.customerId} />
            <OrderInfoCard
              order={refund.orderId}
              orderSnapshot={refund.orderSnapshot}
              store={refund.storeId}
            />
          </div>

          {/* Refund Details */}
          <RefundDetailsCard refund={refund} />

          {/* Evidence Files */}
          <EvidenceFilesCard evidenceFiles={refund.evidenceFiles} />

          {/* Payment Information */}
          <PaymentInfoCard order={refund.orderId} />

          {/* Order Items */}
          <OrderItemsCard order={refund.orderId} />

          {/* Delivery Address */}
          <DeliveryAddressCard
            deliveryAddress={refund.orderId?.deliveryAddress}
          />

          {/* Payment Split */}
          <PaymentSplitCard paymentSplit={refund.orderId?.paymentSplit} />

          {/* Rider Information */}
          <RiderInfoCard rider={refund.riderId} />

          {/* Store Details */}
          <StoreDetailsCard store={refund.storeId} />

          {/* Order Timeline */}
          <OrderTimelineCard order={refund.orderId} />

          {/* Admin Decision Section */}
          <AdminDecisionSection
            canReview={canReview}
            refund={refund}
            isApproving={isApproving}
            isRejecting={isRejecting}
            setIsApproving={setIsApproving}
            setIsRejecting={setIsRejecting}
            approvalData={approvalData}
            rejectionData={rejectionData}
            setApprovalData={setApprovalData}
            setRejectionData={setRejectionData}
            handleAmountChange={handleAmountChange}
            handleApprove={handleApprove}
            handleReject={handleReject}
            maxFromStore={maxFromStore}
            maxFromDriver={maxFromDriver}
          />
        </div>
      </div>
    </div>
  );
};

export default RefundDetailModal;
