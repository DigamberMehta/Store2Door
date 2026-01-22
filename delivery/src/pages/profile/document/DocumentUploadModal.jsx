import { useState } from "react";
import { LuX, LuUpload } from "react-icons/lu";

const DocumentUploadModal = ({
  show,
  onClose,
  documentType,
  onUpload,
  uploading,
}) => {
  const [file, setFile] = useState(null);
  const [documentNumber, setDocumentNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  if (!show) return null;

  // Determine which documents need number/expiry fields
  const needsNumber = [
    "idDocument",
    "workPermit",
    "driversLicence",
    "vehicleLicense",
  ].includes(documentType);
  const needsExpiry = [
    "workPermit",
    "driversLicence",
    "vehicleLicense",
  ].includes(documentType);

  const getDocumentTitle = () => {
    const titles = {
      profilePhoto: "Profile Photo",
      vehiclePhoto: "Vehicle Photo",
      idDocument: "ID Document",
      workPermit: "Work Permit",
      driversLicence: "Drivers Licence",
      proofOfBankingDetails: "Proof of Banking Details",
      proofOfAddress: "Proof of Address",
      vehicleLicense: "Vehicle License",
      vehicleAssessment: "Vehicle Assessment",
      carrierAgreement: "Carrier Agreement",
    };
    return titles[documentType] || documentType;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        alert("Please select a valid image (JPG, PNG) or PDF file");
        return;
      }
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    if (needsNumber && !documentNumber) {
      alert("Please enter the document number");
      return;
    }

    const additionalData = {};
    if (needsNumber) {
      additionalData.number = documentNumber;
    }
    if (needsExpiry && expiryDate) additionalData.expiryDate = expiryDate;

    onUpload(documentType, file, additionalData);
  };

  const handleClose = () => {
    setFile(null);
    setDocumentNumber("");
    setExpiryDate("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold">Upload {getDocumentTitle()}</h3>
            <button
              onClick={handleClose}
              className="p-1.5 active:bg-white/5 rounded-full transition-colors"
            >
              <LuX className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          <div className="space-y-3">
            {/* File Upload */}
            <div>
              <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
                Select File (Image or PDF){" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500 file:text-white active:file:bg-blue-600 file:cursor-pointer"
              />
              {file && (
                <p className="text-[10px] text-green-400 mt-1.5">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* Document Number Field */}
            {needsNumber && (
              <div>
                <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
                  Document Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Enter document number"
                  disabled={uploading}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors placeholder:text-zinc-600"
                />
              </div>
            )}

            {/* Expiry Date Field */}
            {needsExpiry && (
              <div>
                <label className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1.5 block">
                  Expiry Date{" "}
                  {needsNumber && (
                    <span className="text-zinc-600">(optional)</span>
                  )}
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={uploading}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300/50 transition-colors"
                />
              </div>
            )}

            {/* Upload Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full bg-blue-500 active:bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <LuUpload className="w-4 h-4" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
