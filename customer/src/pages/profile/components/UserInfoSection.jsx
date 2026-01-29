import { Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserInfoSection = ({ isAuthenticated, userData }) => {
  const navigate = useNavigate();

  if (isAuthenticated) {
    return (
      <div className="px-4 pt-3 pb-2">
        <h2 className="text-white font-bold text-xl mb-0.5">{userData.name}</h2>
        <div className="flex items-center gap-1.5 opacity-50">
          <Phone className="w-3 h-3" />
          <p className="text-white text-xs tracking-wide">{userData.phone}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 pb-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4 text-center">
        <User className="w-10 h-10 text-white/40 mx-auto mb-2" />
        <h2 className="text-white font-bold text-base mb-1">
          Sign in to your account
        </h2>
        <p className="text-white/50 text-xs mb-4">
          Access your orders, saved addresses, and more
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 bg-[rgb(49,134,22)] text-white text-sm font-semibold py-2.5 rounded-xl active:bg-[rgb(49,134,22)]/90 transition-all"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="flex-1 bg-white/10 border border-white/20 text-white text-sm font-semibold py-2.5 rounded-xl active:bg-white/20 transition-all"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoSection;
