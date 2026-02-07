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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const balance = wallet?.balance || 0;
  const balanceInRands = balance / 100;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3 sm:py-4">
            <button
              onClick={() => navigate("/profile")}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">My Wallet</h1>
              <p className="text-xs text-white/50">Balance & Transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-white/80" />
              <span className="text-xs sm:text-sm text-white/80 font-medium">
                Available Balance
              </span>
            </div>

            <div className="mb-2 sm:mb-4">
              <span className="text-3xl sm:text-5xl font-bold text-white">
                R {balanceInRands.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-white/70">
              This balance can be used on your next order
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
              <span className="text-xs text-white/50">Total Credits</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">
              {transactions.filter((t) => t.type === "credit").length}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <TrendingDown className="w-3 sm:w-4 h-3 sm:h-4 text-red-400" />
              <span className="text-xs text-white/50">Total Debits</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">
              {transactions.filter((t) => t.type === "debit").length}
            </span>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-white/5 rounded-full mb-2 sm:mb-3">
                <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-white/30" />
              </div>
              <p className="text-xs sm:text-sm text-white/50">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {transactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);
                const amountInRands = transaction.amount / 100;

                return (
                  <div
                    key={transaction._id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <div
                          className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                            transaction.type === "credit"
                              ? "bg-green-500/20"
                              : "bg-red-500/20"
                          }`}
                        >
                          <Icon className={`w-4 sm:w-5 h-4 sm:h-5 ${colorClass}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-white mb-0.5 sm:mb-1">
                            {transaction.type === "credit"
                              ? "Wallet Credited"
                              : "Wallet Debited"}
                          </p>
                          <p className="text-xs text-white/50 mb-0.5 sm:mb-1 truncate">
                            {transaction.description}
                          </p>
                          {transaction.refundId && (
                            <div className="flex items-center gap-1 text-xs text-white/30">
                              <DollarSign className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate">
                                Refund #{transaction.refundId.slice(-6)}
                              </span>
                            </div>
                          )}
                          {transaction.orderId && (
                            <div className="flex items-center gap-1 text-xs text-white/30">
                              <Package className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate">
                                Order #{transaction.orderId.slice(-6)}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-white/30 mt-0.5 sm:mt-1">
                            {new Date(transaction.date).toLocaleString(
                              "en-ZA",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-sm sm:text-base font-bold ${colorClass}`}>
                          {transaction.type === "credit" ? "+" : "-"}R{" "}
                          {amountInRands.toFixed(2)}
                        </span>
                        <p className="text-xs text-white/50 mt-0.5 sm:mt-1 whitespace-nowrap">
                          Balance: R{" "}
                          {(transaction.balanceAfter / 100).toFixed(2)}
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
