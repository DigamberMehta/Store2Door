import { useState, useEffect } from "react";
import { Save, CreditCard, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { storeAPI } from "../../../../services/store/api/store.api";

const BankAccountPage = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingStore, setFetchingStore] = useState(true);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    accountType: "savings",
    branchCode: "",
  });

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const fetchStoreProfile = async () => {
    try {
      setFetchingStore(true);
      const response = await storeAPI.getMyBankAccount();

      if (response.success) {
        const store = response.data;
        setFormData({
          accountHolderName: store.accountHolderName || "",
          bankName: store.bankName || "",
          accountNumber: store.accountNumber || "",
          accountType: store.accountType || "savings",
          branchCode: store.branchCode || "",
        });
      }
    } catch (error) {
      console.error("Error fetching store:", error);
      toast.error("Failed to load bank account details");
    } finally {
      setFetchingStore(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await storeAPI.update(formData);

      if (response.success) {
        toast.success("Bank account details updated successfully!");
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error("Failed to update bank account details");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingStore) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <h1 className="text-lg font-bold text-gray-900">Bank Account</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your bank account for payouts and transfers
        </p>
      </div>

      <div className="px-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Bank Details Security
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Your bank account information is encrypted and stored securely.
                We never share this information with third parties.
              </p>
            </div>
          </div>

          {/* Bank Account Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-green-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Bank Account Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Account Holder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  placeholder="Full name on bank account"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must match the name on your bank account
                </p>
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bank Name *
                </label>
                <select
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                >
                  <option value="">Select your bank</option>
                  <option value="ABSA">ABSA</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="FNB">FNB (First National Bank)</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Capitec">Capitec</option>
                  <option value="Discovery Bank">Discovery Bank</option>
                  <option value="TymeBank">TymeBank</option>
                  <option value="African Bank">African Bank</option>
                  <option value="Investec">Investec</option>
                  <option value="Bidvest Bank">Bidvest Bank</option>
                </select>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account Type *
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                >
                  <option value="savings">Savings Account</option>
                  <option value="cheque">Cheque Account</option>
                  <option value="business">Business Account</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  placeholder="Enter your account number"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your account number will be encrypted and kept secure
                </p>
              </div>

              {/* Branch Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Branch Code *
                </label>
                <input
                  type="text"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  placeholder="6-digit branch code"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this on your bank statement or contact your bank
                </p>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Preferred Currency
                </label>
                <div className="px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-700 font-medium">
                    ZAR - South African Rand
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountPage;
