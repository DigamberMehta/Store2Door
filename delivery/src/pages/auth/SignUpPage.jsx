import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuUser, LuMail, LuLock, LuPhone, LuArrowLeft } from "react-icons/lu";
import { driverAuthAPI, storeAuthData } from "../../services/api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
      };

      const response = await driverAuthAPI.register(registrationData);

      if (response.success) {
        // Store auth data
        storeAuthData(response.data);

        // Navigate to dashboard
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col px-4 pb-6 overflow-y-auto">
      {/* Back Button */}
      <div className="pt-6 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-white/5 p-1.5 rounded-full border border-white/5 active:scale-90 transition-transform"
        >
          <LuArrowLeft className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Header */}
      <div className="mb-5">
        <p className="text-2xl font-bold tracking-tight mb-1">Join Our Fleet</p>
        <p className="text-zinc-500 text-sm">
          Fill in your details to start earning as a partner
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 ml-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-3 text-sm focus:border-blue-300/50 outline-none transition-all"
              />
              <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 ml-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-3 text-sm focus:border-blue-300/50 outline-none transition-all"
              />
              <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 ml-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+27 00000 00000"
                required
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-3 text-sm focus:border-blue-300/50 outline-none transition-all"
              />
              <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 ml-1">
              Create Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-3 text-sm focus:border-blue-300/50 outline-none transition-all"
              />
              <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            </div>
            <p className="text-[9px] text-zinc-600 ml-1">
              Minimum 8 characters
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-300 text-black py-3 rounded-xl font-bold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
      <div className="pt-5 text-center mt-auto">
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
