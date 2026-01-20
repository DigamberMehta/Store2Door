import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, ArrowLeft, Bike, Truck, Car } from "lucide-react";
import { driverAuthAPI, storeAuthData } from "../../services/api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "bike"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const vehicleOptions = [
    { id: "bike", label: "Bike", icon: Bike },
    { id: "scooter", label: "Scooter", icon: Bike },
    { id: "car", label: "Car", icon: Car },
    { id: "truck", label: "Truck", icon: Truck },
  ];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleVehicleSelect = (vehicleId) => {
    setFormData(prev => ({
      ...prev,
      vehicleType: vehicleId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare data for backend (use 'name' instead of 'fullName')
      const registrationData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        vehicleType: formData.vehicleType
      };

      const response = await driverAuthAPI.register(registrationData);
      
      if (response.success) {
        // Store auth data
        storeAuthData(response.data);
        
        // Navigate to onboarding/documents page
        navigate("/documents");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      <form onSubmit={handleSubmit} className="space-y-6 flex-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Full Name</label>
            <div className="relative">
              <input 
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
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
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+27 00000 00000"
                required
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
                  type="button"
                  onClick={() => handleVehicleSelect(option.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    formData.vehicleType === option.id 
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-blue-300/50 outline-none transition-all"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-[10px] text-zinc-600 ml-1">Minimum 8 characters</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-300 text-black py-4 rounded-2xl font-bold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

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
