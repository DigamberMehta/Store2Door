import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  ShieldCheck, 
  Truck, 
  ChevronRight, 
  FileText, 
  LogOut,
  Mail,
  Phone,
  Camera,
  X,
  Upload,
  CheckCircle2,
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
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [newArea, setNewArea] = useState("");
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

  const verifications = [
    { id: 1, title: "Driver's License", status: "Verified", icon: FileText, color: "text-emerald-400", canEdit: true },
    { id: 2, title: "Vehicle Insurance", status: "Verified", icon: ShieldCheck, color: "text-emerald-400", canEdit: true },
  ];

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

  const deliveryAreas = [
    "South Delhi",
    "North Delhi",
    "Gurgaon",
    "Noida",
    "Dwarka"
  ];

  const handleUpload = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            setSelectedDoc(null);
            setUploadProgress(0);
          }, 2000);
        }, 500);
      }
    }, 200);
  };

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

      {/* Upload Modal Overlay */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isUploading && setSelectedDoc(null)}
          />
          
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Upload {selectedDoc.title}</h3>
                {!isUploading && (
                  <button 
                    onClick={() => setSelectedDoc(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-500" />
                  </button>
                )}
              </div>

              {!isSuccess ? (
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/5">
                    {isUploading ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-blue-400 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-zinc-300">Uploading document...</p>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">{uploadProgress}% Complete</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                          <Camera className="w-8 h-8 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Click to capture or upload</p>
                          <p className="text-xs text-zinc-500 mt-1">Files supported: JPG, PNG, PDF</p>
                        </div>
                        <button 
                          onClick={handleUpload}
                          className="w-full bg-blue-500 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all"
                        >
                          Select File
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed text-center px-4">
                    By uploading, you confirm that the document is valid, clear, and matches your profile information.
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center space-y-4 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Upload Successful</h4>
                    <p className="text-sm text-zinc-400 mt-1">Your document is being reviewed.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="bg-gradient-to-b from-blue-300/10 to-transparent pt-12 pb-8 px-6 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-zinc-800 rounded-full border-2 border-blue-400/30 flex items-center justify-center overflow-hidden mx-auto">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-zinc-600" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full border-4 border-black active:scale-90 transition-transform">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-3xl font-bold">{user.name}</p>
      </div>

      <div className="px-4 space-y-6">
        {/* Document Verification Section */}
        <div>
          <h3 className="text-sm font-bold text-zinc-400 mb-3 px-2">Document Verification</h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            {verifications.map((doc, index) => (
              <button 
                key={doc.id} 
                onClick={() => doc.canEdit && setSelectedDoc(doc)}
                className={`w-full flex items-center justify-between p-4 ${index !== verifications.length - 1 ? 'border-b border-white/5' : ''} ${doc.canEdit ? 'active:bg-white/10 cursor-pointer' : 'opacity-80 cursor-default'} transition-colors text-left`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-800 p-2 rounded-xl">
                    <doc.icon className={`w-5 h-5 ${doc.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{doc.title}</p>
                      {!doc.canEdit && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                    </div>
                    {doc.id === 2 && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">{user.vehicle}</p>
                    )}
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${doc.color}`}>{doc.status}</p>
                  </div>
                </div>
                {doc.canEdit && <ChevronRight className="w-4 h-4 text-zinc-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Details */}
        <div>
          <h3 className="text-sm font-bold text-zinc-400 mb-3 px-2">Basic Details</h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-2 space-y-1">
            <div className="flex items-center gap-4 p-3 rounded-xl transition-colors">
              <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Full Name</p>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 active:bg-white/5 rounded-xl transition-colors cursor-pointer group">
              <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Email Address</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </div>

            <div className="flex items-center gap-4 p-3 active:bg-white/5 rounded-xl transition-colors cursor-pointer group">
              <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Phone Number</p>
                <p className="text-sm font-medium">{user.phone}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl transition-colors">
              <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Date of Birth</p>
                <p className="text-sm font-medium">{user.dob}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 active:bg-white/5 rounded-xl transition-colors cursor-pointer group">
              <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">Current Address</p>
                <p className="text-sm font-medium leading-relaxed">{user.address}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 className="text-sm font-bold text-zinc-400 mb-3 px-2 flex justify-between items-center">
            Bank Details
            <button className="text-[10px] text-blue-400 uppercase tracking-widest font-bold bg-blue-400/10 px-2 py-1 rounded">Update</button>
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-2 space-y-1">
            <div className="flex items-center gap-4 p-3 rounded-xl transition-colors">
              <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">{user.bank.bankName}</p>
                <p className="text-sm font-medium">**** **** **** {user.bank.account}</p>
                <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">IFSC: {user.bank.ifsc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Preferences */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-400 mb-3 px-2">Work Preferences</h3>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-6">
              {/* Shift Selection */}
              <button 
                onClick={() => setShowShiftModal(true)}
                className="w-full text-left space-y-3 active:bg-white/5 p-2 rounded-xl transition-colors"
              >
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Selected Shifts ({selectedShifts.length})
                  </p>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedShifts.length > 0 ? (
                    selectedShifts.slice(0, 3).map((shift, idx) => (
                      <div key={idx} className="bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg">
                        <span className="text-blue-100 font-bold text-[11px]">{shift.replace(":00 ", " ")}</span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-zinc-800/50 border border-white/5 px-3 py-1.5 rounded-lg">
                      <span className="text-zinc-500 font-bold text-[11px]">No shifts selected</span>
                    </div>
                  )}
                  {selectedShifts.length > 3 && (
                    <div className="bg-zinc-800/50 border border-white/5 px-3 py-1.5 rounded-lg">
                      <span className="text-zinc-400 font-bold text-[11px]">+{selectedShifts.length - 3} more</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Area Selection */}
              <div className="space-y-4">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-2">
                  <Map className="w-3 h-3" /> Preferred Areas
                </p>
                
                {/* Area Input */}
                <div className="relative">
                  <input 
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="Type to add area (e.g. Rohini)"
                    className="w-full bg-zinc-800/50 border border-white/5 rounded-xl py-3 px-4 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600"
                  />
                  {newArea && (
                    <button 
                      onClick={() => {
                        setNewArea("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-1 rounded-lg text-xs font-bold"
                    >
                      ADD
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {deliveryAreas.map((area) => (
                    <div 
                      key={area}
                      className={`px-4 py-2 rounded-full text-xs transition-all border flex items-center gap-2 ${
                        user.preferences.areas.includes(area)
                        ? 'bg-blue-500 border-blue-500 text-white font-bold' 
                        : 'bg-zinc-800 border-white/5 text-zinc-400'
                      }`}
                    >
                      {area}
                      {user.preferences.areas.includes(area) && <X className="w-3 h-3 cursor-pointer" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="pb-8">
          <button 
            onClick={() => navigate("/login")}
            className="w-full bg-red-500/10 border border-red-500/10 rounded-2xl p-4 flex items-center justify-between active:bg-red-500/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-500/20 p-2 rounded-xl text-red-400">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-red-400">Sign Out</span>
            </div>
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
