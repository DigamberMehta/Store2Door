import { LuLandmark, LuChevronRight } from "react-icons/lu";

const BankDetails = ({ user, onBankClick }) => {
  return (
    <div>
      <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">
        Bank Details
      </h3>
      <div className="bg-white/5 border border-white/5 rounded-2xl p-1.5 space-y-1">
        <button
          onClick={onBankClick}
          className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group w-full"
        >
          <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
            <LuLandmark className="w-4 h-4" />
          </div>
          {user.bank ? (
            <div className="flex-1 text-left">
              <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
                {user.bank.bankName}
              </p>
              <p className="text-xs font-medium">
                **** **** **** {user.bank.account}
              </p>
              <p className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">
                Branch Code: {user.bank.ifsc}
              </p>
            </div>
          ) : (
            <div className="flex-1 text-left">
              <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
                Bank Account
              </p>
              <p className="text-xs font-medium text-zinc-500 italic">
                Tap to add bank details
              </p>
            </div>
          )}
          <LuChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default BankDetails;
