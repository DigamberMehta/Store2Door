import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driverProfileAPI, driverAuthAPI } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import {
  LuUser,
  LuCamera,
  LuFileText,
  LuChevronRight,
  LuLogOut,
  LuLandmark,
  LuTruck,
  LuPhone,
} from "react-icons/lu";
import BottomNavigation from "../../components/home/BottomNavigation";
import ShiftModal from "./work/ShiftModal";
import PhotoUploadModal from "./document/PhotoUploadModal";
import BasicDetails from "./personal/BasicDetails";
import WorkPreferences from "./work/WorkPreferences";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [bankData, setBankData] = useState(null);

  // Fetch profile data
  useEffect(() => {
    fetchProfileData();
    fetchBankData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await driverProfileAPI.getProfile();
      setProfileData(response.data);

      // Set work schedule - simple array of shift time strings
      if (
        response.data.profile?.workSchedule &&
        Array.isArray(response.data.profile.workSchedule)
      ) {
        // Ensure all items are strings
        const validShifts = response.data.profile.workSchedule.filter(
          (shift) => typeof shift === "string",
        );
        setSelectedShifts(validShifts);
      } else {
        setSelectedShifts([]);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBankData = async () => {
    try {
      const response = await driverProfileAPI.getBankAccount();

      setBankData(response.data.bankDetails);
    } catch (error) {

    }
  };

  const handleUpdateShifts = async () => {
    try {
      setUpdating(true);
      await driverProfileAPI.updateAvailability({
        workSchedule: selectedShifts,
      });
      toast.success("Work shifts updated successfully!");
      setShowShiftModal(false);
      await fetchProfileData();
    } catch (error) {
      console.error("Error updating shifts:", error);
      toast.error(error.response?.data?.message || "Failed to update shifts");
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      await driverProfileAPI.uploadDocument("profilePhoto", file);
      toast.success("Profile photo updated successfully!");
      setShowPhotoUploadModal(false);
      await fetchProfileData();
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload profile photo",
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await driverAuthAPI.logout();

      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear local storage
      localStorage.clear();

      // Clear session storage
      sessionStorage.clear();

      toast.success("Logged out successfully");

      // Redirect to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if API fails, clear local data and redirect
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  // Extract user data with fallbacks
  const user = profileData
    ? {
        name: profileData.user?.name || "Driver",
        email: profileData.user?.email || "Not provided",
        phone: profileData.user?.phone || "Not provided",
        dob: profileData.profile?.dateOfBirth
          ? new Date(profileData.profile.dateOfBirth).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" },
            )
          : null,
        address: profileData.profile?.address?.street
          ? `${profileData.profile.address.street || ""}, ${profileData.profile.address.city || ""}, ${profileData.profile.address.province || ""} ${profileData.profile.address.postalCode || ""}`
              .trim()
              .replace(/^,\s*|,\s*$/g, "")
              .replace(/,\s*,/g, ",")
          : null,
        avatar:
          profileData.profile?.documents?.profilePhoto?.imageUrl ||
          profileData.user?.avatar ||
          null,
        vehicle: profileData.profile?.vehicleDetails?.make
          ? `${profileData.profile.vehicleDetails.make || ""} ${profileData.profile.vehicleDetails.model || ""} • ${profileData.profile.vehicleDetails.registrationNumber || ""}`.trim()
          : null,
        bank:
          bankData?.accountNumber ||
          bankData?.accountHolderName ||
          bankData?.bankName
            ? {
                account: bankData.accountNumber?.slice(-4) || "****",
                bankName: bankData.bankName || "Not provided",
                ifsc: bankData.branchCode || "Not provided",
              }
            : null,
        preferences: {
          areas: profileData.profile?.serviceAreas || [],
          maxDeliveriesPerDay:
            profileData.profile?.preferences?.maxDeliveriesPerDay || 20,
          preferredVehicleType:
            profileData.profile?.preferences?.preferredVehicleType || null,
          acceptCashPayments:
            profileData.profile?.preferences?.acceptCashPayments ?? true,
          autoAcceptOrders:
            profileData.profile?.preferences?.autoAcceptOrders ?? false,
          notifications: {
            sms:
              profileData.profile?.preferences?.notificationPreferences?.sms ??
              true,
            email:
              profileData.profile?.preferences?.notificationPreferences
                ?.email ?? true,
            push:
              profileData.profile?.preferences?.notificationPreferences?.push ??
              true,
          },
        },
      }
    : null;

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
    "11:00 PM - 12:00 AM",
  ];

  const handleShiftToggle = (shift) => {
    if (selectedShifts.includes(shift)) {
      setSelectedShifts(selectedShifts.filter((s) => s !== shift));
    } else {
      setSelectedShifts([...selectedShifts, shift]);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-zinc-400">Failed to load profile</p>
          <button
            onClick={fetchProfileData}
            className="mt-4 px-6 py-2 bg-blue-500 rounded-full text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      />

      {/* Modals */}
      <ShiftModal
        show={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        shifts={shifts}
        selectedShifts={selectedShifts}
        onShiftToggle={handleShiftToggle}
        onUpdate={handleUpdateShifts}
        updating={updating}
      />

      <PhotoUploadModal
        show={showPhotoUploadModal}
        onClose={() => setShowPhotoUploadModal(false)}
        onUpload={handlePhotoUpload}
        uploading={uploadingPhoto}
      />

      {/* Header Profile Section */}
      <div className="bg-gradient-to-b from-blue-300/10 to-transparent pt-10 pb-6 px-4 text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 bg-zinc-800 rounded-full border-2 border-blue-400/30 flex items-center justify-center overflow-hidden mx-auto">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <LuUser className="w-10 h-10 text-zinc-600" />
            )}
          </div>
          <button
            onClick={() => setShowPhotoUploadModal(true)}
            className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full border-2 border-black active:scale-90 transition-transform"
          >
            <LuCamera className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-2xl font-bold">{user.name}</p>
      </div>

      <div className="px-3 space-y-4">
        {/* Document Verification Section */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">
            Compliance & Documents
          </h3>
          <button
            onClick={() => navigate("/profile/documents")}
            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-300/10 p-2.5 rounded-xl">
                <LuFileText className="w-5 h-5 text-blue-300" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs">Identity & Vehicle Proof</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Manage and upload your documents
                </p>
              </div>
            </div>
            <LuChevronRight className="w-4 h-4 text-zinc-600" />
          </button>
        </div>

        {/* Basic Details */}
        <BasicDetails user={user} />

        {/* Bank Details */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">
            Bank Details
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-1.5 space-y-1">
            <button
              onClick={() => navigate("/profile/bank-account")}
              className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group w-full"
            >
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <LuLandmark className="w-4 h-4" />
              </div>
              {user.bank ? (
                <div className="flex-1 text-left">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
                    {user.bank.bankName}
                  </p>
                  <p className="text-xs font-medium">
                    **** **** **** {user.bank.account}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">
                    Branch Code: {user.bank.ifsc}
                  </p>
                </div>
              ) : (
                <div className="flex-1 text-left">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
                    Bank Account
                  </p>
                  <p className="text-xs font-medium text-zinc-500 italic">
                    Tap to add bank details
                  </p>
                </div>
              )}
              <LuChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Vehicle Details */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">
            Vehicle Information
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-1.5 space-y-1">
            <button
              onClick={() => navigate("/profile/vehicle-details")}
              className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group w-full"
            >
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <LuTruck className="w-4 h-4" />
              </div>
              {user.vehicle ? (
                <div className="flex-1 text-left">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
                    Vehicle Details
                  </p>
                  <p className="text-xs font-medium">{user.vehicle}</p>
                </div>
              ) : (
                <div className="flex-1 text-left">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
                    Vehicle Details
                  </p>
                  <p className="text-xs font-medium text-zinc-500 italic">
                    Tap to add vehicle details
                  </p>
                </div>
              )}
              <LuChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 mb-2 px-1">
            Emergency Contact
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-1.5 space-y-1">
            <button
              onClick={() => navigate("/profile/emergency-contact")}
              className="flex items-center gap-3 p-2.5 active:bg-white/5 rounded-xl transition-colors cursor-pointer group w-full"
            >
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <LuPhone className="w-4 h-4" />
              </div>
              {profileData?.profile?.emergencyContact?.name ? (
                <div className="flex-1 text-left">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
                    Emergency Contact
                  </p>
                  <p className="text-xs font-medium">
                    {profileData.profile.emergencyContact.name} •{" "}
                    {profileData.profile.emergencyContact.phone}
                  </p>
                  {profileData.profile.emergencyContact.relationship && (
                    <p className="text-[9px] text-zinc-500 font-bold mt-0.5 uppercase tracking-wider">
                      {profileData.profile.emergencyContact.relationship}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex-1 text-left">
                  <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
                    Emergency Contact
                  </p>
                  <p className="text-xs font-medium text-zinc-500 italic">
                    Tap to add emergency contact
                  </p>
                </div>
              )}
              <LuChevronRight className="w-3.5 h-3.5 text-zinc-600 group-active:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Work Preferences */}
        <WorkPreferences
          user={user}
          selectedShifts={selectedShifts}
          onShiftClick={() => setShowShiftModal(true)}
          onAreasClick={() => navigate("/profile/areas")}
        />

        {/* Sign Out */}
        <div className="pb-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/5 border border-red-500/10 rounded-2xl p-3.5 flex items-center justify-between active:bg-red-500/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-500/15 p-2 rounded-xl text-red-500">
                <LuLogOut className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-red-500">Sign Out</span>
            </div>
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
