import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Filter
} from "lucide-react";
import BottomNavigation from "../../components/home/BottomNavigation";

const ActivitiesPage = () => {
  const navigate = useNavigate();

  const allActivities = [
    { id: 1, type: "withdrawal", amount: "- $120.00", status: "Success", date: "Jan 18, 2026", time: "2:30 PM", note: "Sent to Bank (**** 4291)" },
    { id: 2, type: "credit", amount: "+ $45.20", status: "Success", date: "Jan 18, 2026", time: "11:15 AM", note: "Delivery Pay - ORD-7234" },
    { id: 3, type: "credit", amount: "+ $12.00", status: "Success", date: "Jan 18, 2026", time: "11:15 AM", note: "Tip - ORD-7234" },
    { id: 4, type: "debit", amount: "- $5.00", status: "Success", date: "Jan 17, 2026", time: "8:00 PM", note: "App Service Fee" },
    { id: 5, type: "credit", amount: "+ $38.50", status: "Success", date: "Jan 17, 2026", time: "4:20 PM", note: "Delivery Pay - ORD-7192" },
    { id: 6, type: "credit", amount: "+ $5.00", status: "Success", date: "Jan 17, 2026", time: "4:20 PM", note: "Tip - ORD-7192" },
    { id: 7, type: "credit", amount: "+ $52.40", status: "Success", date: "Jan 16, 2026", time: "6:10 PM", note: "Weekly Bonus - Tier 2" },
    { id: 8, type: "debit", amount: "- $5.00", status: "Success", date: "Jan 16, 2026", time: "8:00 PM", note: "App Service Fee" },
  ];

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">All Activities</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Transaction History</p>
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
        <div className="space-y-3">
          {allActivities.map((tx) => (
            <div key={tx.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between active:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                  tx.type === 'withdrawal' || tx.type === 'debit' ? 'bg-zinc-800' : 'bg-emerald-500/10'
                }`}>
                  {tx.type === 'withdrawal' || tx.type === 'debit' ? (
                    <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-100">{tx.note}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{tx.date} • {tx.time}</p>
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

      <BottomNavigation />
    </div>
  );
};

export default ActivitiesPage;
