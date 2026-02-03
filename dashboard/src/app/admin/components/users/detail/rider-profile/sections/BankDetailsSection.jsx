import { CreditCard, Edit } from "lucide-react";

const BankDetailsSection = ({ profile, onEditClick }) => {
  if (!profile.bankDetails) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-700" />
          <h2 className="text-base font-semibold text-gray-900">
            Bank Details
          </h2>
        </div>
        <button
          onClick={onEditClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {profile.bankDetails.accountHolderName && (
          <div>
            <span className="text-xs text-gray-500">Account Holder Name</span>
            <p className="text-sm font-medium text-gray-900">
              {profile.bankDetails.accountHolderName}
            </p>
          </div>
        )}
        {profile.bankDetails.bankName && (
          <div>
            <span className="text-xs text-gray-500">Bank Name</span>
            <p className="text-sm font-medium text-gray-900">
              {profile.bankDetails.bankName}
            </p>
          </div>
        )}
        {profile.bankDetails.accountNumber && (
          <div>
            <span className="text-xs text-gray-500">Account Number</span>
            <p className="text-sm font-medium text-gray-900 font-mono">
              {profile.bankDetails.accountNumber}
            </p>
          </div>
        )}
        {profile.bankDetails.routingNumber && (
          <div>
            <span className="text-xs text-gray-500">Routing Number</span>
            <p className="text-sm font-medium text-gray-900 font-mono">
              {profile.bankDetails.routingNumber}
            </p>
          </div>
        )}
        {profile.bankDetails.branchCode && (
          <div>
            <span className="text-xs text-gray-500">Branch Code</span>
            <p className="text-sm font-medium text-gray-900">
              {profile.bankDetails.branchCode}
            </p>
          </div>
        )}
        {profile.bankDetails.accountType && (
          <div>
            <span className="text-xs text-gray-500">Account Type</span>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {profile.bankDetails.accountType}
            </p>
          </div>
        )}
        <div>
          <span className="text-xs text-gray-500">Verification Status</span>
          <p
            className={`text-sm font-medium ${
              profile.bankDetails.isVerified
                ? "text-green-600"
                : "text-yellow-600"
            }`}
          >
            {profile.bankDetails.isVerified ? "Verified" : "Pending"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsSection;
