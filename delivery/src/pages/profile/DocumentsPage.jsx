import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  Car,
  ChevronRight,
  Clock,
  AlertCircle
} from "lucide-react";

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(null); // ID of doc being uploaded

  const documentList = [
    {
      id: "license",
      title: "Driver's License",
      description: "Front and back side of your valid license",
      status: "verified",
      icon: FileText
    },
    {
      id: "rc",
      title: "Vehicle Registration (RC)",
      description: "Valid RC of your registered vehicle",
      status: "pending",
      icon: Car
    },
    {
      id: "insurance",
      title: "Vehicle Insurance",
      description: "Active insurance policy document",
      status: "missing",
      icon: ShieldCheck
    },
    {
      id: "pan",
      title: "PAN Card",
      description: "For tax and payment verification",
      status: "verified",
      icon: CreditCard
    },
    {
      id: "aadhaar",
      title: "Aadhaar Card",
      description: "Identity and address proof",
      status: "missing",
      icon: CreditCard
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "verified":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "missing":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "missing":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleUpload = (id) => {
    setUploading(id);
    // Simulate upload
    setTimeout(() => {
      setUploading(null);
    }, 2000);
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      {/* Header */}
      <div className="pt-8 px-4 pb-4 bg-zinc-900/50 backdrop-blur-xl border-b border-white/5 flex items-center gap-4 sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white/5 p-1.5 rounded-full border border-white/5 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div>
          <p className="text-lg font-bold">Documents</p>
          <p className="text-[10px] text-zinc-500 font-medium">Verify your identity and vehicle</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress Alert */}
        <div className="bg-blue-300/10 border border-blue-300/20 rounded-2xl p-3 flex gap-4">
          <div className="bg-blue-300/20 p-2 rounded-xl h-fit">
            <ShieldCheck className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <p className="font-bold text-xs">Verification Status: 60%</p>
            <p className="text-[10px] text-zinc-400 mt-1">Submit the remaining 2 documents to start accepting orders.</p>
          </div>
        </div>

        {/* Doc List */}
        <div className="space-y-2">
          {documentList.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3"
            >
              <div className="bg-white/5 p-2 rounded-xl">
                <doc.icon className="w-5 h-5 text-zinc-400" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-xs">{doc.title}</h3>
                  <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold flex items-center gap-1 border ${getStatusStyle(doc.status)}`}>
                    {getStatusIcon(doc.status)}
                    {doc.status.toUpperCase()}
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">{doc.description}</p>
              </div>

              <button 
                onClick={() => handleUpload(doc.id)}
                disabled={uploading === doc.id || doc.status === "verified"}
                className={`p-2 rounded-xl border transition-all active:scale-90 ${
                  doc.status === "verified" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-50 cursor-default"
                  : "bg-blue-300 text-black border-blue-300 shadow-lg shadow-blue-300/10"
                }`}
              >
                {uploading === doc.id ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Guidelines */}
        <div className="mt-6">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 mb-3">Guidelines</h2>
          <div className="space-y-2">
            {[
              "Ensure documents are original and valid",
              "Photos should be clear with all text readable",
              "File size should be under 5MB (JPG, PNG, PDF)",
              "Verification process takes 24-48 hours"
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-300 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Support */}
      <div className="mt-auto p-4 pb-8 text-center">
        <p className="text-[10px] text-zinc-500">Need help with document submission?</p>
        <button className="text-blue-300 font-bold text-xs mt-1">Contact Support</button>
      </div>
    </div>
  );
};

export default DocumentsPage;
