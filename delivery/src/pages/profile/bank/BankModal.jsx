import { LuX } from "react-icons/lu";

const BankModal = ({
  show,
  onClose,
  bankForm,
  setBankForm,
  onUpdate,
  updating,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Bank Account Details</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <LuX className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 font-medium mb-2 block">
                Account Holder Name
              </label>
              <input
                type="text"
                value={bankForm.accountHolderName}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    accountHolderName: e.target.value,
                  })
                }
                placeholder="Full name as per bank"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-medium mb-2 block">
                Account Number
              </label>
              <input
                type="text"
                value={bankForm.accountNumber}
                onChange={(e) =>
                  setBankForm({ ...bankForm, accountNumber: e.target.value })
                }
                placeholder="Enter account number"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-medium mb-2 block">
                Bank Name
              </label>
              <input
                type="text"
                value={bankForm.bankName}
                onChange={(e) =>
                  setBankForm({ ...bankForm, bankName: e.target.value })
                }
                placeholder="e.g., Standard Bank, FNB, ABSA"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-medium mb-2 block">
                Branch Code
              </label>
              <input
                type="text"
                value={bankForm.branchCode}
                onChange={(e) =>
                  setBankForm({ ...bankForm, branchCode: e.target.value })
                }
                placeholder="6-digit branch code"
                maxLength="6"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-medium mb-2 block">
                Account Type
              </label>
              <select
                value={bankForm.accountType}
                onChange={(e) =>
                  setBankForm({ ...bankForm, accountType: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="cheque">Cheque Account</option>
                <option value="savings">Savings Account</option>
                <option value="transmission">Transmission Account</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onUpdate}
              disabled={updating}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Bank Details"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankModal;
