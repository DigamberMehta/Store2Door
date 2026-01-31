import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  XCircle,
} from "lucide-react";
import BottomNavigation from "../../components/home/BottomNavigation";
import { driverProfileAPI } from "../../services/api";
import { formatDate } from "../../utils/date";

const WithdrawalsPage = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await driverProfileAPI.getWithdrawals();
      if (response.success) {
        setWithdrawals(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-xl font-bold">Withdrawals</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              Transaction History
            </p>
          </div>
        </div>
        <button className="p-2 bg-white/5 rounded-xl">
          <Download className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3 gap-3">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search reference..."
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>
          <button className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <Filter className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Withdrawal List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/5 rounded-2xl p-4 animate-pulse"
              >
                <div className="h-16 bg-white/5 rounded" />
              </div>
            ))
          ) : withdrawals.length === 0 ? (
            // Empty state
            <div className="text-center py-16">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-medium">No withdrawals yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Your withdrawal history will appear here
              </p>
            </div>
          ) : (
            withdrawals.map((item) => {
              const statusConfig = {
                pending: {
                  icon: Clock,
                  color:
                    "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
                  label: "Pending",
                },
                completed: {
                  icon: CheckCircle2,
                  color:
                    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  label: "Completed",
                },
                failed: {
                  icon: XCircle,
                  color: "bg-red-500/10 border-red-500/20 text-red-400",
                  label: "Failed",
                },
              };

              const status = statusConfig[item.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={item._id}
                  className="bg-white/5 border border-white/5 rounded-2xl p-4 active:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800 p-2.5 rounded-xl">
                        <ArrowUpRight className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          R{Math.abs(item.amount).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${status.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-2">
                    {item.description && (
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-zinc-500">
                          Description:
                        </span>
                        <span className="text-[11px] text-zinc-300 font-medium">
                          {item.description}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-zinc-500">
                        Transaction ID:
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {item._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default WithdrawalsPage;
