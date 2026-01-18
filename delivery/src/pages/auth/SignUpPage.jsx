import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, ArrowLeft, Bike, Truck, Car } from "lucide-react";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState("bike");

  const vehicleOptions = [
    { id: "bike", label: "Bike", icon: Bike },
    { id: "scooter", label: "Scooter", icon: Bike }, // reusing bike icon for simplicity
    { id: "car", label: "Car", icon: Car },
    { id: "truck", label: "Truck", icon: Truck },
  ];

  return (
    <div className="bg-black min-h-screen text-white flex flex-col px-6 pb-8 overflow-y-auto">
      {/* Back Button */}
      <div className="pt-8 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white/5 p-2 rounded-full border border-white/5 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <p className="text-4xl font-bold tracking-tight mb-2">Join Our Fleet</p>
        <p className="text-zinc-500 text-sm">Fill in your details to start earning as a partner</p>
      </div>

      {/* Form Section */}
      <div className="space-y-6 flex-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-blue-300/50 outline-none transition-all"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-blue-300/50 outline-none transition-all"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Phone Number</label>
            <div className="relative">
              <input 
                type="tel" 
                placeholder="+91 00000 00000"
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-blue-300/50 outline-none transition-all"
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Vehicle Type</label>
            <div className="grid grid-cols-2 gap-3">
              {vehicleOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setVehicleType(option.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    vehicleType === option.id 
                    ? 'bg-blue-300/10 border-blue-300/50 text-blue-300' 
                    : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-sm font-bold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Create Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-blue-300/50 outline-none transition-all"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate("/")}
          className="w-full bg-blue-300 text-black py-4 rounded-2xl font-bold active:scale-[0.98] transition-all"
        >
          Create Account
        </button>
      </div>

      {/* Footer */}
      <div className="pt-8 text-center mt-auto">
        <p className="text-zinc-500 text-sm">
          Already a partner? 
          <button 
            onClick={() => navigate("/login")}
            className="text-blue-300 font-bold ml-1 hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
