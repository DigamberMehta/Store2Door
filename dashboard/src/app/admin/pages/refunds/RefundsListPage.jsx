import React, { useState, useEffect } from "react";
import { DollarSign, RefreshCw } from "lucide-react";
import {
  refundAPI,
  walletAPI,
} from "../../../../services/admin/api/refund.api";
import toast from "react-hot-toast";
import RefundFilters from "../../components/refunds/RefundFilters";
import RefundTable from "../../components/refunds/RefundTable";
import RefundStatsCards from "../../components/refunds/RefundStatsCards";
import RefundDetailModal from "../../components/refunds/RefundDetailModal";

const RefundsListPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    refundReason: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    page: 1,
    limit: 20,
  });

  // Fetch refunds
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await refundAPI.getAll(filters);
      if (response.success) {
        setRefunds(response.data.refunds);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error("Failed to fetch refunds");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const [refundStatsRes, walletStatsRes] = await Promise.all([
        refundAPI.getStats(),
        walletAPI.getStats(),
      ]);

      if (refundStatsRes.success) {
        setStats(refundStatsRes.data.stats);
      }
      if (walletStatsRes.success) {
        setWalletStats(walletStatsRes.data.stats);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleRefundClick = async (refund) => {
    try {
      const response = await refundAPI.getById(refund._id);
      if (response.success) {
        setSelectedRefund(response.data.refund);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching refund details:", error);
      toast.error("Failed to load refund details");
    }
  };

  const handleApprove = async (refundId, approvalData) => {
    try {
      const response = await refundAPI.approve(refundId, approvalData);
      if (response.success) {
        toast.success("Refund approved successfully");
        setShowDetailModal(false);
        fetchRefunds();
        fetchStats();
      }
    } catch (error) {
      console.error("Error approving refund:", error);
      toast.error(error.response?.data?.message || "Failed to approve refund");
    }
  };

  const handleReject = async (refundId, rejectionData) => {
    try {
      const response = await refundAPI.reject(refundId, rejectionData);
      if (response.success) {
        toast.success("Refund rejected");
        setShowDetailModal(false);
        fetchRefunds();
        fetchStats();
      }
    } catch (error) {
      console.error("Error rejecting refund:", error);
      toast.error(error.response?.data?.message || "Failed to reject refund");
    }
  };

  const handleExport = async () => {
    try {
      toast.loading("Exporting refunds...");
      await refundAPI.export(filters);
      toast.dismiss();
      toast.success("Refunds exported successfully");
    } catch (error) {
      toast.dismiss();
      console.error("Error exporting refunds:", error);
      toast.error("Failed to export refunds");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-1.5 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Refund Management
              </h1>
              <p className="text-xs text-gray-600">
                Review and process customer refund requests
              </p>
            </div>
          </div>
          <button
            onClick={fetchRefunds}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <RefundStatsCards stats={stats} walletStats={walletStats} />

        {/* Filters */}
        <RefundFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          loading={loading}
        />

        {/* Refunds Table */}
        <RefundTable
          refunds={refunds}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRefundClick={handleRefundClick}
          loading={loading}
        />

        {/* Refund Detail Modal */}
        {showDetailModal && selectedRefund && (
          <RefundDetailModal
            refund={selectedRefund}
            onClose={() => setShowDetailModal(false)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </div>
  );
};

export default RefundsListPage;
