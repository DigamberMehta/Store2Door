import { ChevronLeft, ShoppingBag, MapPin, Phone, User, HelpCircle, LogOut, Mail, Lock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("main");

  const [userData] = useState({
    name: "Srishti",
    email: "srishti@example.com",
    phone: "+91-9084610979"
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => {
              if (view === "account") setView("main");
              else navigate(-1);
            }}
            className="p-2 -ml-2 active:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-semibold tracking-tight">
            {view === "account" ? "Account Details" : "Profile"}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {view === "main" ? (
        <>
          {/* User Info Section */}
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-white font-bold text-2xl mb-1">{userData.name}</h2>
            <div className="flex items-center gap-1.5 opacity-50">
              <Phone className="w-3.5 h-3.5" />
              <p className="text-white text-sm tracking-wide">{userData.phone}</p>
            </div>
          </div>

          {/* Settings Content */}
          <div className="px-2.5 pt-2 pb-4 space-y-3">
            {/* Account Details */}
            <button 
              onClick={() => setView("account")}
              className="w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-4 active:bg-white/10 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <User className="w-5 h-5 text-white/70" />
                  </div>
                  <span className="text-white font-medium text-sm">Account details</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            </button>

            {/* Your Orders */}
            <button className="w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-4 active:bg-white/10 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-white/70" />
                </div>
                <span className="text-white font-medium text-sm">Your orders</span>
              </div>
            </button>

            {/* Address Book */}
            <button className="w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-4 active:bg-white/10 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl">
                  <MapPin className="w-5 h-5 text-white/70" />
                </div>
                <span className="text-white font-medium text-sm">Address book</span>
              </div>
            </button>

            {/* Help Section */}
            <button className="w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-4 active:bg-white/10 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl">
                  <HelpCircle className="w-5 h-5 text-white/70" />
                </div>
                <span className="text-white font-medium text-sm">Help</span>
              </div>
            </button>

            {/* Sign Out Section */}
            <button 
              className="w-full bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/5 p-4 active:bg-white/10 transition-all text-left group"
              onClick={() => {
                // Handle sign out
                console.log("Signing out...");
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                  <LogOut className="w-5 h-5 text-white/60 group-active:text-white" />
                </div>
                <span className="text-white/70 font-medium text-sm">Sign out</span>
              </div>
            </button>
          </div>
        </>
      ) : (
        /* Account Details View */
        <div className="px-2.5 pt-4 space-y-3">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <User className="w-6 h-6 text-white/70" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40 mb-0.5 uppercase tracking-wider font-semibold">Name</p>
                  <p className="text-white font-medium">{userData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <Mail className="w-6 h-6 text-white/70" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40 mb-0.5 uppercase tracking-wider font-semibold">Email</p>
                  <p className="text-white font-medium">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <Phone className="w-6 h-6 text-white/70" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40 mb-0.5 uppercase tracking-wider font-semibold">Phone Number</p>
                  <p className="text-white font-medium">{userData.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-4 active:bg-white/10 transition-all text-left group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl">
                  <Lock className="w-5 h-5 text-white/70" />
                </div>
                <span className="text-white font-medium text-sm">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
