import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driverProfileAPI, driverAuthAPI } from "../../services/api";
import toast, { Toaster } from 'react-hot-toast';
import { 
  User, 
  ChevronRight, 
  FileText, 
  LogOut,
  Mail,
  Phone,
  Camera,
  X,
  Calendar,
  MapPin,
  Landmark,
  Clock,
  Map,
  Check
} from "lucide-react";
import BottomNavigation from "../../components/home/BottomNavigation";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showDobModal, setShowDobModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [bankData, setBankData] = useState(null);
  
  // Form states
  const [dobForm, setDobForm] = useState("");
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: ""
  });
  const [bankForm, setBankForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    branchCode: "",
    accountType: "cheque"
  });

  // Fetch profile data
  useEffect(() => {
    fetchProfileData();
    fetchBankData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await driverProfileAPI.getProfile();
      setProfileData(response.data);
      
      // Set work schedule if available
      if (response.data.profile?.workSchedule) {
        const activeShifts = response.data.profile.workSchedule
          .filter(s => s.isWorking)
          .map(s => `${s.startTime} - ${s.endTime}`);
        setSelectedShifts(activeShifts);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBankData = async () => {
    try {
      const response = await driverProfileAPI.getBankAccount();
      console.log("Bank data response:", response.data.bankDetails);
      setBankData(response.data.bankDetails);
    } catch (error) {
      console.error("Error fetching bank data:", error);
    }
  };

  const handleUpdateDob = async () => {
    if (!dobForm) {
      toast.error("Please enter a valid date");
      return;
    }

    try {
      setUpdating(true);
      await driverProfileAPI.updateProfile({ dateOfBirth: dobForm });
      toast.success("Date of birth updated successfully!");
      setShowDobModal(false);
      await fetchProfileData();
    } catch (error) {
      console.error("Error updating DOB:", error);
      toast.error(error.response?.data?.message || "Failed to update date of birth");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.province || !addressForm.postalCode) {
      toast.error("Please fill in all address fields");
      return;
    }

    try {
      setUpdating(true);
      await driverProfileAPI.updateProfile({ address: addressForm });
      toast.success("Address updated successfully!");
      setShowAddressModal(false);
      await fetchProfileData();
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error(error.response?.data?.message || "Failed to update address");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBank = async () => {
    if (!bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.bankName || !bankForm.branchCode) {
      toast.error("Please fill in all bank details");
      return;
    }

    try {
      setUpdating(true);
      await driverProfileAPI.updateBankAccount(bankForm);
      toast.success("Bank details updated successfully!");
      setShowBankModal(false);
      await fetchBankData();
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error(error.response?.data?.message || "Failed to update bank details");
    } finally {
      setUpdating(false);
    }
  };

  // Extract user data with fallbacks
  const user = profileData ? {
    name: profileData.user?.name || "Driver",
    email: profileData.user?.email || "Not provided",
    phone: profileData.user?.phone || "Not provided",
    dob: profileData.profile?.dateOfBirth 
      ? new Date(profileData.profile.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
    address: profileData.profile?.address?.street
      ? `${profileData.profile.address.street || ''}, ${profileData.profile.address.city || ''}, ${profileData.profile.address.province || ''} ${profileData.profile.address.postalCode || ''}`.trim().replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')
      : null,
    avatar: profileData.user?.avatar || null,
    vehicle: profileData.profile?.vehicleDetails?.make
      ? `${profileData.profile.vehicleDetails.make || ''} ${profileData.profile.vehicleDetails.model || ''} • ${profileData.profile.vehicleDetails.registrationNumber || ''}`.trim()
      : null,
    bank: (bankData?.accountNumber || bankData?.accountHolderName || bankData?.bankName) ? {
      account: bankData.accountNumber?.slice(-4) || "****",
      bankName: bankData.bankName || "Not provided",
      ifsc: bankData.branchCode || "Not provided"
    } : null,
    preferences: {
      areas: profileData.profile?.preferredWorkAreas || []
    }
  } : null;

  const shifts = [
    "06:00 AM - 07:00 AM",
    "07:00 AM - 08:00 AM",
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM",
    "07:00 PM - 08:00 PM",
    "08:00 PM - 09:00 PM",
    "09:00 PM - 10:00 PM",
    "10:00 PM - 11:00 PM",
    "11:00 PM - 12:00 AM"
  ];

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-zinc-400">Failed to load profile</p>
          <button 
            onClick={fetchProfileData}
            className="mt-4 px-6 py-2 bg-blue-500 rounded-full text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
      
      {/* DOB Edit Modal */}
      {showDobModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDobModal(false)}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Update Date of Birth</h3>
                <button 
                  onClick={() => setShowDobModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Date of Birth</label>
                  <input
                    type="date"
                    value={dobForm}
                    onChange={(e) => setDobForm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUpdateDob}
                  disabled={updating}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Date of Birth'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Edit Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddressModal(false)}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Update Address</h3>
                <button 
                  onClick={() => setShowAddressModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Street Address</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    placeholder="Enter street address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium mb-2 block">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      placeholder="City"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-zinc-400 font-medium mb-2 block">Province</label>
                    <input
                      type="text"
                      value={addressForm.province}
                      onChange={(e) => setAddressForm({...addressForm, province: e.target.value})}
                      placeholder="Province"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                    placeholder="Enter postal code"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUpdateAddress}
                  disabled={updating}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Address'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowBankModal(false)}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Bank Account Details</h3>
                <button 
                  onClick={() => setShowBankModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Account Holder Name</label>
                  <input
                    type="text"
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({...bankForm, accountHolderName: e.target.value})}
                    placeholder="Full name as per bank"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Account Number</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                    placeholder="Enter account number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Bank Name</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                    placeholder="e.g., Standard Bank, FNB, ABSA"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Branch Code</label>
                  <input
                    type="text"
                    value={bankForm.branchCode}
                    onChange={(e) => setBankForm({...bankForm, branchCode: e.target.value})}
                    placeholder="6-digit branch code"
                    maxLength="6"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Account Type</label>
                  <select
                    value={bankForm.accountType}
                    onChange={(e) => setBankForm({...bankForm, accountType: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="cheque">Cheque Account</option>
                    <option value="savings">Savings Account</option>
                    <option value="transmission">Transmission Account</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateBank}
                  disabled={updating}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Save Bank Details'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Shift Selection Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowShiftModal(false)}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Select Active Shift</h3>
                <button 
                  onClick={() => setShowShiftModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-none">
                {shifts.map((shift) => (
                  <button
                    key={shift}
                    onClick={() => {
                      if (selectedShifts.includes(shift)) {
                        setSelectedShifts(selectedShifts.filter(s => s !== shift));
                      } else {
                        setSelectedShifts([...selectedShifts, shift]);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      selectedShifts.includes(shift)
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-semibold text-sm">{shift}</span>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedShifts.includes(shift) ? 'bg-blue-500 border-blue-500' : 'border-zinc-700'
                    }`}>
                      {selectedShifts.includes(shift) && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                    </div>
                  </button>
                ))}
              </div>
              <button 
                type="button"
                onClick={() => setShowShiftModal(false)}
                className="w-full bg-blue-500 py-4 rounded-2xl font-bold mt-6 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="bg-gradient-to-b from-blue-300/10 to-transparent pt-10 pb-6 px-4 text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 bg-zinc-800 rounded-full border-2 border-blue-400/30 flex items-center justify-center overflow-hidden mx-auto">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-zinc-600" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full border-2 border-black active:scale-90 transition-transform">
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-2xl font-bold">{user.name}</p>
      </div>

      <div className="px-3 space-y-4">
        {/* Document Verification Section */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">Compliance & Documents</h3>
          <button 
            onClick={() => navigate("/profile/documents")}
            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-300/10 p-2.5 rounded-xl">
                <FileText className="w-5 h-5 text-blue-300" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs">Identity & Vehicle Proof</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Manage and upload your documents</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-amber-500/10 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/20 uppercase">
                Pending
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>
          </button>
        </div>

        {/* Basic Details */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">Basic Details</h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-1.5 space-y-1">
            <div className="flex items-center gap-3 p-2.5 rounded-xl transition-colors">
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Full Name</p>
                <p className="text-xs font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group">
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Email Address</p>
                <p className="text-xs font-medium">{user.email}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </div>

            <div className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group">
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Phone Number</p>
                <p className="text-xs font-medium">{user.phone}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </div>

            <button 
              onClick={() => {
                setDobForm(profileData?.profile?.dateOfBirth?.split('T')[0] || "");
                setShowDobModal(true);
              }}
              className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group w-full"
            >
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Date of Birth</p>
                <p className={`text-xs font-medium ${!user.dob ? 'text-zinc-500 italic' : ''}`}>
                  {user.dob || 'Tap to add date of birth'}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                setAddressForm({
                  street: profileData?.profile?.address?.street || "",
                  city: profileData?.profile?.address?.city || "",
                  province: profileData?.profile?.address?.province || "",
                  postalCode: profileData?.profile?.address?.postalCode || ""
                });
                setShowAddressModal(true);
              }}
              className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group w-full"
            >
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Current Address</p>
                <p className={`text-xs font-medium leading-relaxed ${!user.address ? 'text-zinc-500 italic' : ''}`}>
                  {user.address || 'Tap to add your address'}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">Bank Details</h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-1.5 space-y-1">
            <button
              onClick={() => {
                setBankForm({
                  accountHolderName: bankData?.accountHolderName || "",
                  accountNumber: bankData?.accountNumber || "",
                  bankName: bankData?.bankName || "",
                  branchCode: bankData?.branchCode || "",
                  accountType: bankData?.accountType || "cheque"
                });
                setShowBankModal(true);
              }}
              className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group w-full"
            >
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <Landmark className="w-4 h-4" />
              </div>
              {user.bank ? (
                <div className="flex-1 text-left">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">{user.bank.bankName}</p>
                  <p className="text-xs font-medium">**** **** **** {user.bank.account}</p>
                  <p className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">Branch Code: {user.bank.ifsc}</p>
                </div>
              ) : (
                <div className="flex-1 text-left">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Bank Account</p>
                  <p className="text-xs font-medium text-zinc-500 italic">Tap to add bank details</p>
                </div>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Work Preferences */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">Work Preferences</h3>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 space-y-4">
              {/* Shift Selection */}
              <button 
                onClick={() => setShowShiftModal(true)}
                className="w-full text-left space-y-2.5 active:bg-white/5 p-1.5 rounded-xl transition-colors"
              >
                <div className="flex justify-between items-center">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Selected Shifts ({selectedShifts.length})
                  </p>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedShifts.length > 0 ? (
                    selectedShifts.slice(0, 3).map((shift, idx) => (
                      <div key={idx} className="bg-blue-300/10 border border-blue-300/20 px-2.5 py-1 rounded-lg">
                        <span className="text-blue-200 font-bold text-[10px]">{shift.replace(":00 ", " ")}</span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-zinc-800/50 border border-white/5 px-2.5 py-1 rounded-lg">
                      <span className="text-zinc-600 font-bold text-[10px]">No shifts selected</span>
                    </div>
                  )}
                  {selectedShifts.length > 3 && (
                    <div className="bg-zinc-800/50 border border-white/5 px-2 py-1 rounded-lg">
                      <span className="text-zinc-500 font-bold text-[10px]">+{selectedShifts.length - 3} more</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Area Selection */}
              <button 
                onClick={() => navigate("/profile/areas")}
                className="w-full text-left space-y-2.5 active:bg-white/5 p-1.5 rounded-xl transition-colors"
              >
                <div className="flex justify-between items-center">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-2">
                    <Map className="w-3 h-3" /> Preferred Areas ({user.preferences.areas.length})
                  </p>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.preferences.areas.map((area) => (
                    <div 
                      key={area}
                      className="bg-zinc-800/80 border border-white/5 px-2.5 py-1 rounded-lg"
                    >
                      <span className="text-zinc-400 font-bold text-[10px]">{area}</span>
                    </div>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="pb-6">
          <button 
            onClick={() => navigate("/login")}
            className="w-full bg-red-500/5 border border-red-500/10 rounded-2xl p-3.5 flex items-center justify-between active:bg-red-500/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-500/15 p-2 rounded-xl text-red-500">
                <LogOut className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-red-500">Sign Out</span>
            </div>
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
