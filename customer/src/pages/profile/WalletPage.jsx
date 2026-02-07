import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Package,
} from "lucide-react";
import {
  getWallet,
  getWalletTransactions,
} from "../../services/api/refund.api";
import { toast } from "react-hot-toast";

const WalletPage = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        getWallet(),
        getWalletTransactions(),
      ]);

      if (walletRes.success) {
        setWallet(walletRes.data.wallet);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    if (type === "credit") return TrendingUp;
    return TrendingDown;
  };

  const getTransactionColor = (type) => {
    if (type === "credit") return "text-green-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-white/10 border-t-green-500"></div>
      </div>
    );
  }

  const balance = wallet?.balance || 0;
  const balanceInRands = balance / 100;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-black/98 backdrop-blur-lg border-b border-white/5 z-10">
        <div className="px-3 sm:px-4">
          <div className="flex items-center gap-3 py-2.5 sm:py-3">
            <button
              onClick={() => navigate("/profile")}
              className="shrink-0 p-2.5 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                My Wallet
              </h1>
              <p className="text-xs text-white/40">Balance & Transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-4">
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-linear-to-br from-green-600 to-green-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -translate-y-10 sm:-translate-y-12 translate-x-10 sm:translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full translate-y-10 sm:translate-y-12 -translate-x-10 sm:-translate-x-12"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 sm:mb-5">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 shrink-0" />
              <span className="text-xs sm:text-sm text-white/80 font-medium">
                Available Balance
              </span>
            </div>

            <div className="mb-2 sm:mb-3">
              <span className="text-3xl sm:text-5xl font-bold text-white break-word">
                R {balanceInRands.toFixed(2)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              This balance can be used on your next order
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="bg-white/5 hover:bg-white/8 active:bg-white/10 transition-colors backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 touch-manipulation">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
              <span className="text-xs text-white/50 font-medium truncate">
                Total Credits
              </span>
            </div>
            <span className="text-lg sm:text-2xl font-bold text-white block">
              {transactions.filter((t) => t.type === "credit").length}
            </span>
          </div>

          <div className="bg-white/5 hover:bg-white/8 active:bg-white/10 transition-colors backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 touch-manipulation">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />
              <span className="text-xs text-white/50 font-medium truncate">
                Total Debits
              </span>
            </div>
            <span className="text-lg sm:text-2xl font-bold text-white block">
              {transactions.filter((t) => t.type === "debit").length}
            </span>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white mb-3 px-1">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 bg-white/5 rounded-full mb-2 sm:mb-3">
                <Clock className="w-6 sm:w-7 h-6 sm:h-7 text-white/30" />
              </div>
              <p className="text-xs text-white/50 font-medium">
                No transactions yet
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5">
              {transactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);
                const amountInRands = transaction.amount / 100;

                return (
                  <div
                    key={transaction._id}
                    className="bg-white/5 hover:bg-white/8 active:bg-white/10 transition-colors backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 touch-manipulation"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 sm:p-2.5 rounded-lg shrink-0 ${
                            transaction.type === "credit"
                              ? "bg-green-500/20"
                              : "bg-red-500/20"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClass}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-white leading-tight mb-0.5">
                            {transaction.type === "credit"
                              ? "Wallet Credited"
                              : "Wallet Debited"}
                          </p>
                          <p className="text-xs text-white/50 mb-1 sm:mb-1.5 line-clamp-1">
                            {transaction.description}
                          </p>
                          <div className="space-y-0.5 sm:space-y-1">
                            {transaction.refundId && (
                              <div className="flex items-center gap-1.5 text-xs text-white/40">
                                <DollarSign className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  Refund #{transaction.refundId.slice(-6)}
                                </span>
                              </div>
                            )}
                            {transaction.orderId && (
                              <div className="flex items-center gap-1.5 text-xs text-white/40">
                                <Package className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  Order #{transaction.orderId.slice(-6)}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-white/30 mt-1 sm:mt-1.5 leading-tight">
                            {new Date(transaction.date).toLocaleString(
                              "en-ZA",
                              {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-bold break-word ${colorClass}`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}R{" "}
                          {amountInRands.toFixed(2)}
                        </span>
                        <p className="text-xs text-white/50 mt-0.5 sm:mt-1 whitespace-nowrap">
                          R {(transaction.balanceAfter / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
