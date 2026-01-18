import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  TrendingUp, 
  Calendar,
  ChevronRight
} from "lucide-react";
import BottomNavigation from "../../components/home/BottomNavigation";

const WalletPage = () => {
  const navigate = useNavigate();

  const transactions = [
    { id: 1, type: "withdrawal", amount: "- $120.00", status: "Success", date: "Today, 2:30 PM", note: "Sent to Bank (**** 4291)" },
    { id: 2, type: "credit", amount: "+ $45.20", status: "Success", date: "Today, 11:15 AM", note: "Delivery Pay - ORD-7234" },
    { id: 3, type: "credit", amount: "+ $12.00", status: "Success", date: "Today, 11:15 AM", note: "Tip - ORD-7234" },
    { id: 4, type: "debit", amount: "- $5.00", status: "Success", date: "Yesterday", note: "App Service Fee" },
  ];

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <p className="text-xl font-bold">My Wallet</p>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 rounded-3xl p-6 border border-emerald-500/20 shadow-[0_8px_32px_rgba(16,185,129,0.1)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-emerald-400/60 text-[10px] font-bold uppercase tracking-widest">Available Balance</p>
              <h2 className="text-3xl font-bold mt-1">$1,245.89</h2>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <button 
            onClick={() => navigate("/withdrawals")}
            className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
          >
            Withdraw Funds
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Today</p>
            <p className="text-sm font-bold text-emerald-400">+$157.34</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Weekly</p>
            <p className="text-sm font-bold text-white">$842.10</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Monthly</p>
            <p className="text-sm font-bold text-white">$2.4k</p>
          </div>
        </div>

        {/* Withdrawal Highlight */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Withdrawn</p>
              <p className="text-sm font-bold text-white">$4,230.00</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/withdrawals")}
            className="text-[11px] text-blue-400 font-bold flex items-center gap-1"
          >
            History <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-500" />
              Recent Activities
            </h3>
            <button 
              onClick={() => navigate("/activities")}
              className="text-xs text-zinc-500 font-medium active:text-blue-300"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between active:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${
                    tx.type === 'withdrawal' || tx.type === 'debit' ? 'bg-zinc-800' : 'bg-emerald-500/10'
                  }`}>
                    {tx.type === 'withdrawal' ? (
                      <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    ) : tx.type === 'debit' ? (
                      <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">{tx.note}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    tx.type === 'credit' ? 'text-emerald-400' : 'text-white'
                  }`}>{tx.amount}</p>
                  <p className="text-[9px] text-emerald-500/50 font-bold uppercase tracking-tighter mt-0.5">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default WalletPage;
