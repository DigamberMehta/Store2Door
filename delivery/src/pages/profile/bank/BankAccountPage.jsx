import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driverProfileAPI } from "../../../services/api";
import toast from "react-hot-toast";
import { LuChevronLeft, LuSave } from "react-icons/lu";

const BankAccountPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    branchCode: "",
    accountType: "cheque",
  });

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      setLoading(true);
      const response = await driverProfileAPI.getBankAccount();
      const bankData = response.data.bankDetails;
      if (bankData) {
        setBankForm({
          accountHolderName: bankData.accountHolderName || "",
          accountNumber: bankData.accountNumber || "",
          bankName: bankData.bankName || "",
          branchCode: bankData.branchCode || "",
          accountType: bankData.accountType || "cheque",
        });
      }
    } catch (error) {
      console.error("Error fetching bank data:", error);
      toast.error("Failed to load bank details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !bankForm.accountHolderName ||
      !bankForm.accountNumber ||
      !bankForm.bankName ||
      !bankForm.branchCode
    ) {
      toast.error("Please fill in all required bank details");
      return;
    }

    try {
      setUpdating(true);
      await driverProfileAPI.updateBankAccount(bankForm);
      toast.success("Bank details updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error(
        error.response?.data?.message || "Failed to update bank details",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 active:bg-white/5 rounded-full transition-colors"
          >
            <LuChevronLeft className="w-5 h-5" />
          </button>
          <p className="text-md font-bold">Bank Account Details</p>
        </div>
      </div>

      <div className="px-3 pt-4 space-y-4">
        {/* Bank Account Form */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 space-y-3">
          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Account Holder Name <span className="text-red-400">*</span>
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
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Account Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={bankForm.accountNumber}
              onChange={(e) =>
                setBankForm({ ...bankForm, accountNumber: e.target.value })
              }
              placeholder="Enter account number"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Bank Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={bankForm.bankName}
              onChange={(e) =>
                setBankForm({ ...bankForm, bankName: e.target.value })
              }
              placeholder="e.g., Standard Bank, FNB, ABSA"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Branch Code <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={bankForm.branchCode}
              onChange={(e) =>
                setBankForm({ ...bankForm, branchCode: e.target.value })
              }
              placeholder="6-digit branch code"
              maxLength="6"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Account Type <span className="text-red-400">*</span>
            </label>
            <select
              value={bankForm.accountType}
              onChange={(e) =>
                setBankForm({ ...bankForm, accountType: e.target.value })
              }
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors"
            >
              <option value="cheque">Cheque Account</option>
              <option value="savings">Savings Account</option>
              <option value="transmission">Transmission Account</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={updating}
          className="w-full bg-blue-500 active:bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
        >
          {updating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <LuSave className="w-4 h-4" />
              Save Bank Details
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BankAccountPage;
