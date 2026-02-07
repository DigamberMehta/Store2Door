import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  AlertCircle,
} from "lucide-react";
import { getMyRefunds } from "../../services/api/refund.api";
import { toast } from "react-hot-toast";

const RefundsPage = () => {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const response = await getMyRefunds();
      if (response.success) {
        setRefunds(response.data.refunds || []);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error("Failed to load refund requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_review: {
        icon: Clock,
        color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
        label: "Pending Review",
      },
      under_review: {
        icon: AlertCircle,
        color: "text-blue-400 bg-blue-500/20 border-blue-500/30",
        label: "Under Review",
      },
      approved: {
        icon: CheckCircle,
        color: "text-green-400 bg-green-500/20 border-green-500/30",
        label: "Approved",
      },
      rejected: {
        icon: XCircle,
        color: "text-red-400 bg-red-500/20 border-red-500/30",
        label: "Rejected",
      },
      completed: {
        icon: CheckCircle,
        color: "text-green-400 bg-green-500/20 border-green-500/30",
        label: "Completed",
      },
      failed: {
        icon: XCircle,
        color: "text-red-400 bg-red-500/20 border-red-500/30",
        label: "Failed",
      },
    };

    const config = statusConfig[status] || statusConfig.pending_review;
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </div>
    );
  };

  const getReasonLabel = (reason) => {
    const labels = {
      not_delivered: "Not Delivered",
      delivered_wrong_items: "Wrong Items",
      delivered_damaged_items: "Damaged Items",
      delivered_incomplete_order: "Incomplete Order",
      quality_issue: "Quality Issue",
      late_delivery: "Late Delivery",
      delivery_mishap: "Delivery Problem",
      customer_cancelled: "Customer Cancelled",
      store_cancelled: "Store Cancelled",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => navigate("/profile")}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">My Refunds</h1>
              <p className="text-xs text-white/50">
                {refunds.length} refund request{refunds.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {refunds.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-4">
              <DollarSign className="w-10 h-10 text-white/30" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No Refund Requests
            </h2>
            <p className="text-white/50 mb-6">
              You haven't requested any refunds yet
            </p>
            <button
              onClick={() => navigate("/profile/orders")}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-medium rounded-xl transition-colors"
            >
              View Orders
            </button>
          </div>
        ) : (
          refunds.map((refund) => (
            <div
              key={refund._id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white/70">
                      Order #
                      {refund.orderId?.orderNumber ||
                        refund.orderSnapshot?.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-white/30">
                    Requested{" "}
                    {new Date(refund.createdAt).toLocaleDateString("en-ZA")}
                  </p>
                </div>
                {getStatusBadge(refund.status)}
              </div>

              {/* Amount */}
              {refund.approvedAmount && (
                <div className="bg-black/30 rounded-xl p-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-green-400/70">
                      Refund Amount:
                    </span>
                    <span className="text-xl font-bold text-green-400">
                      R {refund.approvedAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="mb-3">
                <span className="text-xs text-white/50">Reason: </span>
                <span className="text-sm text-white">
                  {getReasonLabel(refund.refundReason)}
                </span>
              </div>

              {/* Customer Note */}
              {refund.customerNote && (
                <div className="bg-black/30 rounded-xl p-3 mb-3">
                  <p className="text-xs text-white/70">{refund.customerNote}</p>
                </div>
              )}

              {/* Admin Response */}
              {refund.status === "rejected" && refund.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-xs text-red-400 font-medium mb-1">
                    Rejection Reason:
                  </p>
                  <p className="text-xs text-red-300/80">
                    {refund.rejectionReason}
                  </p>
                </div>
              )}

              {refund.status === "completed" && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  <p className="text-xs text-green-400 font-medium">
                    ✓ Refund credited to your wallet
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RefundsPage;
