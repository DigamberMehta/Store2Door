import {
  LuUser,
  LuMail,
  LuPhone,
  LuCalendar,
  LuMapPin,
  LuChevronRight,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const BasicDetails = ({ user }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/profile/personal-details");
  };

  return (
    <div>
      <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">
        Basic Details
      </h3>
      <div
        onClick={handleClick}
        className="bg-white/5 border border-white/5 rounded-2xl p-1.5 space-y-1 cursor-pointer"
      >
        <div className="flex items-center gap-3 p-2.5 rounded-xl transition-colors">
          <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
            <LuUser className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
              Full Name
            </p>
            <p className="text-xs font-medium">{user.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors group">
          <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
            <LuMail className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
              Email Address
            </p>
            <p className="text-xs font-medium">{user.email}</p>
          </div>
          <LuChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
        </div>

        <div className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors group">
          <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
            <LuPhone className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
              Phone Number
            </p>
            <p className="text-xs font-medium">{user.phone}</p>
          </div>
          <LuChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
        </div>

        <div className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors group">
          <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
            <LuCalendar className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
              Date of Birth
            </p>
            <p
              className={`text-xs font-medium ${!user.dob ? "text-zinc-500 italic" : ""}`}
            >
              {user.dob || "Tap to add date of birth"}
            </p>
          </div>
          <LuChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
        </div>

        <div className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors group">
          <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
            <LuMapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
              Current Address
            </p>
            <p
              className={`text-xs font-medium leading-relaxed ${!user.address ? "text-zinc-500 italic" : ""}`}
            >
              {user.address || "Tap to add your address"}
            </p>
          </div>
          <LuChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;
