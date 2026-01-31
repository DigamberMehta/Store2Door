import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
} from "lucide-react";
import BottomNavigation from "../../components/home/BottomNavigation";
import { ordersAPI } from "../../services/api";
import { formatDateOnly } from "../../utils/date";

const ActivitiesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const fetchAllTransactions = async () => {
    try {
      const response = await ordersAPI.getTransactions(50); // Get more transactions for activity view
      if (response.success) {
        setTransactions(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white pb-32">
        <div className="p-4 flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-md z-50 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <p className="text-xl font-bold">All Activities</p>
            </div>
          </div>
        </div>
        <div className="px-4 mt-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-4 h-16" />
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-xl font-bold">All Activities</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3 gap-3">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search activities..."
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>
          <button className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <Filter className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Activities List */}
        {transactions.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/5">
            <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No activities yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Your delivery history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between active:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-xl ${
                      tx.type === "withdrawal" || tx.type === "debit"
                        ? "bg-zinc-800"
                        : "bg-emerald-500/10"
                    }`}
                  >
                    {tx.type === "withdrawal" || tx.type === "debit" ? (
                      <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">
                      {tx.description || tx.note}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {formatDateOnly(tx.createdAt || tx.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      tx.type === "credit" || tx.type === "earning"
                        ? "text-emerald-400"
                        : "text-white"
                    }`}
                  >
                    {tx.type === "credit" || tx.type === "earning" ? "+" : "-"}{" "}
                    R{Math.abs(tx.amount || 0).toFixed(2)}
                  </p>
                  <p className="text-[9px] text-emerald-500/50 font-bold uppercase tracking-tighter mt-0.5">
                    {tx.status || "Success"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ActivitiesPage;
