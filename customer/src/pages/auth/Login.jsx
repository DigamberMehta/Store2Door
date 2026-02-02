import { useState } from "react";
import { ChevronLeft, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "phone"
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (loginMethod === "email") {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone number must be 10 digits";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      // Send only the relevant field (email or phone) along with password
      const loginData = {
        password: formData.password,
      };

      if (loginMethod === "email") {
        loginData.email = formData.email;
      } else {
        loginData.phone = formData.phone;
      }

      await login(loginData);

      // Navigate to home
      navigate("/");
    } catch (error) {
      setApiError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[rgb(49,134,22)]/30 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">Login</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-4">
        <div className="max-w-md mx-auto">
          {/* Welcome Text */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
            <p className="text-white/50 text-xs">Sign in to continue</p>
          </div>

          {/* Login Method Toggle */}
          <div className="mb-4">
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  loginMethod === "email"
                    ? "bg-[rgb(49,134,22)] text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  loginMethod === "phone"
                    ? "bg-[rgb(49,134,22)] text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                Phone
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* API Error Message */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-xs">{apiError}</p>
              </div>
            )}

            {/* Email or Phone Input */}
            {loginMethod === "email" ? (
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/60 uppercase tracking-wider font-semibold block">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-4 h-4 text-white/40" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={`w-full bg-white/5 backdrop-blur-xl border ${
                      errors.email ? "border-red-500/50" : "border-white/5"
                    } rounded-xl px-3 pl-10 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs px-1">{errors.email}</p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/60 uppercase tracking-wider font-semibold block">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Phone className="w-4 h-4 text-white/40" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10 digit phone number"
                    maxLength="10"
                    className={`w-full bg-white/5 backdrop-blur-xl border ${
                      errors.phone ? "border-red-500/50" : "border-white/5"
                    } rounded-xl px-3 pl-10 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-xs px-1">{errors.phone}</p>
                )}
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/60 uppercase tracking-wider font-semibold block">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-4 h-4 text-white/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full bg-white/5 backdrop-blur-xl border ${
                    errors.password ? "border-red-500/50" : "border-white/5"
                  } rounded-xl px-3 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 active:bg-white/10 rounded-lg transition-all"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-white/40" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/40" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs px-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-[rgb(49,134,22)] active:text-[rgb(49,134,22)]/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[rgb(49,134,22)] text-white text-sm font-semibold py-2.5 rounded-xl active:bg-[rgb(49,134,22)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-5 text-center">
            <p className="text-white/50 text-xs">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-white font-semibold active:text-white/80 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
