import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedShifts, setSelectedShifts] = useState(["06:00 AM - 07:00 AM", "07:00 AM - 08:00 AM"]);

  const user = {
    name: "Srishti Pant",
    email: "srishti@example.com",
    phone: "+1 (555) 000-1234",
    dob: "Oct 24, 1995",
    address: "123 Delivery Lane, New Delhi, 110001",
    bank: {
      account: "8890",
      bankName: "HDFC Bank",
      ifsc: "HDFC0001234"
    },
    preferences: {
      areas: ["South Delhi", "Gurgaon"]
    },
    vehicle: "Toyota Prius • ABC-1234",
    avatar: null // Placeholder
  };

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

  return (
    <div className="bg-black min-h-screen text-white pb-32">
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

            <div className="flex items-center gap-3 p-2.5 rounded-xl transition-colors">
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Date of Birth</p>
                <p className="text-xs font-medium">{user.dob}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group">
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Current Address</p>
                <p className="text-xs font-medium leading-relaxed">{user.address}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1 flex justify-between items-center">
            Bank Details
            <button className="text-[9px] text-blue-300 uppercase tracking-widest font-bold bg-blue-300/10 px-1.5 py-0.5 rounded">Update</button>
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-1.5 space-y-1">
            <div className="flex items-center gap-3 p-2.5 rounded-xl transition-colors">
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <Landmark className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">{user.bank.bankName}</p>
                <p className="text-xs font-medium">**** **** **** {user.bank.account}</p>
                <p className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">IFSC: {user.bank.ifsc}</p>
              </div>
            </div>
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
