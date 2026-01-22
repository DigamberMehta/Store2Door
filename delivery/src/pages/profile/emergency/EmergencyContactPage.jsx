import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driverProfileAPI } from "../../../services/api";
import toast from "react-hot-toast";
import { LuChevronLeft, LuSave, LuPhone } from "react-icons/lu";

const EmergencyContactPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    relationship: "",
    address: "",
  });

  useEffect(() => {
    fetchEmergencyContact();
  }, []);

  const fetchEmergencyContact = async () => {
    try {
      setLoading(true);
      const response = await driverProfileAPI.getProfile();
      const contactData = response.data.profile?.emergencyContact;
      if (contactData) {
        setContactForm({
          name: contactData.name || "",
          phone: contactData.phone || "",
          relationship: contactData.relationship || "",
          address: contactData.address || "",
        });
      }
    } catch (error) {
      console.error("Error fetching emergency contact:", error);
      toast.error("Failed to load emergency contact");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!contactForm.name || !contactForm.phone) {
      toast.error("Name and phone number are required");
      return;
    }

    try {
      setUpdating(true);
      await driverProfileAPI.updateEmergencyContact(contactForm);
      toast.success("Emergency contact updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      toast.error(
        error.response?.data?.message || "Failed to update emergency contact",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 active:bg-white/5 rounded-full transition-colors"
          >
            <LuChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <LuPhone className="w-4 h-4 text-red-400" />
            <h1 className="text-sm font-bold">Emergency Contact</h1>
          </div>
        </div>
      </div>

      <div className="px-3 pt-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3">
          <p className="text-[10px] text-red-400 leading-relaxed">
            This person will be contacted in case of emergency while you're on a
            delivery
          </p>
        </div>

        {/* Emergency Contact Form */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 space-y-3">
          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) =>
                setContactForm({ ...contactForm, name: e.target.value })
              }
              placeholder="Contact person's full name"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={contactForm.phone}
              onChange={(e) =>
                setContactForm({ ...contactForm, phone: e.target.value })
              }
              placeholder="+27 XX XXX XXXX"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Relationship
            </label>
            <select
              value={contactForm.relationship}
              onChange={(e) =>
                setContactForm({ ...contactForm, relationship: e.target.value })
              }
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors"
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="friend">Friend</option>
              <option value="relative">Relative</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
              Address
            </label>
            <textarea
              value={contactForm.address}
              onChange={(e) =>
                setContactForm({ ...contactForm, address: e.target.value })
              }
              placeholder="Full address of emergency contact"
              rows="3"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600 resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={updating}
          className="w-full bg-blue-500 active:bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
        >
          {updating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <LuSave className="w-4 h-4" />
              Save Emergency Contact
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EmergencyContactPage;
