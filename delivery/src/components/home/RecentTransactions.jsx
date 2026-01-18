import { Package, ArrowUpRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentTransactions = () => {
  const navigate = useNavigate();
  const transactions = [
    {
      id: 1,
      icon: Package,
      title: "5 batch deliveries",
      time: "Today | 2:31 pm • 18.7 mi",
      amount: "+ $79.90",
      tip: "+ $21.10 tips",
    },
    {
      id: 2,
      icon: Package,
      title: "3 batch deliveries",
      time: "Yesterday | 4:15 pm • 12.3 mi",
      amount: "+ $52.40",
      tip: "+ $15.60 tips",
    },
    {
      id: 3,
      icon: Package,
      title: "7 batch deliveries",
      time: "Dec 15 | 1:20 pm • 24.5 mi",
      amount: "+ $98.20",
      tip: "+ $28.80 tips",
    },
  ];

  return (
    <div className="mt-6 pb-24 bg-black">
      <div className="flex items-center justify-between mb-3 px-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Recent Transactions</h2>
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
                <transaction.icon className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-white">{transaction.title}</h3>
                <p className="text-[9px] text-zinc-500 mt-0.5">{transaction.time}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{transaction.amount}</p>
                <p className="text-[9px] font-medium text-emerald-400">{transaction.tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
