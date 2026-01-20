import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ChevronRight, Phone, ArrowLeft } from "lucide-react";
import { driverAuthAPI, storeAuthData } from "../../services/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "phone"
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credentials = loginMethod === "email" 
        ? { email: formData.email, password: formData.password }
        : { phone: formData.phone, password: formData.password };

      const response = await driverAuthAPI.login(credentials);
      
      if (response.success) {
        // Store auth data
        storeAuthData(response.data);
        
        // Navigate to home
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col px-6">
      {/* Back Button */}
      <div className="pt-8 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white/5 p-2 rounded-full border border-white/5 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Header */}
      <div className="mb-10">
        <p className="text-4xl font-bold tracking-tight mb-2">Welcome Back!</p>
        <p className="text-zinc-500">Sign in to start your delivery shift</p>
      </div>

      {/* Form Section */}
      <div className="space-y-6 flex-1">
        {/* Toggle Login Method */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setLoginMethod("email")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === "email" ? "bg-blue-300 text-black" : "text-zinc-500"}`}
          >
            Email
          </button>
          <button 
            onClick={() => setLoginMethod("phone")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === "phone" ? "bg-blue-300 text-black" : "text-zinc-500"}`}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMethod === "email" ? (
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
          ) : (
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
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Password</label>
              <button 
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[10px] text-blue-300 font-bold  tracking-widest"
              >
                Forgot?
              </button>
            </div>
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
            className="w-full bg-blue-300 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <p className="text-zinc-500 text-sm">
          New to Door2Door? 
          <button 
            onClick={() => navigate("/signup")}
            className="text-blue-300 font-bold ml-1 hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
