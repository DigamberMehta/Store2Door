import { Package, ArrowUpRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ordersAPI } from "../../services/api";
import { formatDate } from "../../utils/date";

const RecentTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await ordersAPI.getTransactions(3);
        console.log("[RecentTransactions] Response:", response);
        // Backend returns array directly in response.data
        const data = Array.isArray(response?.data) ? response.data : [];

        // Format transactions for display
        const formatted = data.map((t) => {
          return {
            id: t._id || t.id,
            title: `${t.items} ${t.items === 1 ? "item" : "items"} • ${t.storeName || "Store"}`,
            time: formatDate(t.createdAt || t.deliveredAt),
            amount: `+ R${(t.amount || 0).toFixed(2)}`,
            tip: t.tip > 0 ? `+ R${t.tip.toFixed(2)} tips` : null,
          };
        });

        setTransactions(formatted);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="mt-6 pb-24 bg-black">
        <div className="flex items-center justify-between mb-3 px-3">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Recent Transactions
          </h2>
        </div>
        <div className="space-y-2 px-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl p-3 border border-white/5 animate-pulse"
            >
              <div className="h-12 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="mt-6 pb-24 bg-black">
        <div className="flex items-center justify-between mb-3 px-3">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Recent Transactions
          </h2>
        </div>
        <div className="px-3">
          <div className="bg-white/5 rounded-xl p-6 border border-white/5 text-center">
            <p className="text-xs text-zinc-500">No transactions yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pb-24 bg-black">
      <div className="flex items-center justify-between mb-3 px-3">
        <h2 className="text-sm font-bold text-white tracking-tight">
          Recent Transactions
        </h2>
        <button
          onClick={() => navigate("/activities")}
          className="text-xs text-zinc-500 font-medium active:text-blue-300"
        >
          View all
        </button>
      </div>
      <div className="space-y-2 px-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 rounded-lg p-2.5 border border-emerald-500/10">
                <Package className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-white">
                  {transaction.title}
                </h3>
                <p className="text-[9px] text-zinc-500 mt-0.5">
                  {transaction.time}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {transaction.amount}
                </p>
                {transaction.tip && (
                  <p className="text-[9px] font-medium text-emerald-400">
                    {transaction.tip}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
