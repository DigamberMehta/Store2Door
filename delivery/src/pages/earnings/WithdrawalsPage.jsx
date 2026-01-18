import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  Download
} from "lucide-react";
import BottomNavigation from "../../components/home/BottomNavigation";

const WithdrawalsPage = () => {
  const navigate = useNavigate();

  const withdrawals = [
    { id: 1, amount: "$120.00", date: "Jan 18, 2026", time: "2:30 PM", status: "Completed", bank: "Chase Bank (**** 4291)", ref: "TRX-992810" },
    { id: 2, amount: "$450.00", date: "Jan 15, 2026", time: "10:15 AM", status: "Completed", bank: "Chase Bank (**** 4291)", ref: "TRX-991204" },
    { id: 3, amount: "$85.00", date: "Jan 12, 2026", time: "4:45 PM", status: "Completed", bank: "Wells Fargo (**** 1102)", ref: "TRX-988472" },
    { id: 4, amount: "$210.00", date: "Jan 08, 2026", time: "9:00 AM", status: "Completed", bank: "Chase Bank (**** 4291)", ref: "TRX-985123" },
    { id: 5, amount: "$1,300.00", date: "Jan 01, 2026", time: "11:30 AM", status: "Completed", bank: "Chase Bank (**** 4291)", ref: "TRX-980011" },
    { id: 6, amount: "$320.00", date: "Dec 25, 2025", time: "2:00 PM", status: "Completed", bank: "Chase Bank (**** 4291)", ref: "TRX-975542" },
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
            <h1 className="text-xl font-bold">Withdrawals</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Transaction History</p>
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
          {withdrawals.map((item) => (
            <div 
              key={item.id}
              className="bg-white/5 border border-white/5 rounded-2xl p-4 active:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-800 p-2.5 rounded-xl">
                    <ArrowUpRight className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.amount}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">{item.date} • {item.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">{item.status}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-zinc-500">To:</span>
                  <span className="text-[11px] text-zinc-300 font-medium">{item.bank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-zinc-500">Ref:</span>
                  <span className="text-[11px] font-mono text-zinc-400">{item.ref}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default WithdrawalsPage;
