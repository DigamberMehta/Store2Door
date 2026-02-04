import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Save,
  AlertCircle,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authAPI, customerProfileAPI } from "../../services/api";

const ProfileDetailsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // User data (from User model)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Customer profile data (from CustomerProfile model)
  const [profileData, setProfileData] = useState({
    dateOfBirth: "",
    gender: "",
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageRating: null,
    memberSince: null,
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch complete profile data (user + profile + stats in one call)
      const response = await customerProfileAPI.getProfile();

      if (response.success) {
        const { user, profile, stats } = response.data;

        // Set user data
        setUserData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        });

        // Set profile data
        setProfileData({
          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: profile.gender || "",
        });

        // Set stats
        setStats(stats);
      }
    } catch (err) {
      setError(err.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUserDataChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileDataChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Update user data
      const userUpdateResponse = await authAPI.updateProfile(userData);
      if (userUpdateResponse.success) {
        updateProfile(userUpdateResponse.data.user);
      }

      // Update customer profile
      const profileUpdateData = {
        dateOfBirth: profileData.dateOfBirth || undefined,
        gender: profileData.gender || undefined,
      };

      await customerProfileAPI.updateProfile(profileUpdateData);

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[rgb(49,134,22)] mb-3"></div>
          <p className="text-white/60 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[rgb(49,134,22)]/30 font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 -ml-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">
            Profile Details
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1.5 -mr-1.5 active:bg-white/10 rounded-full transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5 text-[rgb(49,134,22)]" />
          </button>
        </div>
      </div>

      <div className="px-3 pt-2 pb-4">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-3 p-3 bg-[rgb(49,134,22)]/10 border border-[rgb(49,134,22)]/20 rounded-xl text-[rgb(49,134,22)] text-xs">
            {success}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-[rgb(49,134,22)]/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[rgb(49,134,22)]" />
              </div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
                Orders
              </p>
            </div>
            <p className="text-white text-xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-[rgb(49,134,22)]/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-[rgb(49,134,22)]" />
              </div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
                Spent
              </p>
            </div>
            <p className="text-white text-xl font-bold">
              ${stats.totalSpent.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="mb-3">
          <h3 className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-2 px-1">
            Basic Information
          </h3>
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
            <div className="p-3 border-b border-white/5">
              <label className="text-white/40 text-[11px] mb-1.5 block">
                Name
              </label>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white/40" />
                </div>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => handleUserDataChange("name", e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="p-3 border-b border-white/5">
              <label className="text-white/40 text-[11px] mb-1.5 block">
                Email
              </label>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-white/40" />
                </div>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) =>
                    handleUserDataChange("email", e.target.value)
                  }
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="p-3 border-b border-white/5">
              <label className="text-white/40 text-[11px] mb-1.5 block">
                Phone
              </label>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-white/40" />
                </div>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) =>
                    handleUserDataChange("phone", e.target.value)
                  }
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                  placeholder="Enter your phone"
                />
              </div>
            </div>

            <div className="p-3 border-b border-white/5">
              <label className="text-white/40 text-[11px] mb-1.5 block">
                Date of Birth
              </label>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-white/40" />
                </div>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) =>
                    handleProfileDataChange("dateOfBirth", e.target.value)
                  }
                  className="flex-1 bg-transparent text-white text-sm outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="p-3">
              <label className="text-white/40 text-[11px] mb-1.5 block">
                Gender
              </label>
              <select
                value={profileData.gender}
                onChange={(e) =>
                  handleProfileDataChange("gender", e.target.value)
                }
                className="w-full bg-white/5 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/5"
              >
                <option value="" className="bg-zinc-900">
                  Select Gender
                </option>
                <option value="male" className="bg-zinc-900">
                  Male
                </option>
                <option value="female" className="bg-zinc-900">
                  Female
                </option>
                <option value="other" className="bg-zinc-900">
                  Other
                </option>
                <option value="prefer_not_to_say" className="bg-zinc-900">
                  Prefer not to say
                </option>
              </select>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ProfileDetailsPage;
