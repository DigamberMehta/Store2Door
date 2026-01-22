import { LuX, LuUser, LuCamera } from "react-icons/lu";

const PhotoUploadModal = ({ show, onClose, onUpload, uploading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Upload Profile Photo</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <LuX className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <LuUser className="w-16 h-16 mx-auto mb-3 text-zinc-600" />
              <p className="text-sm text-zinc-400 mb-4">
                Select a clear photo of yourself
              </p>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <div className="bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors inline-flex items-center gap-2">
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <LuCamera className="w-4 h-4" />
                      <span>Choose Photo</span>
                    </>
                  )}
                </div>
              </label>
            </div>

            <p className="text-[10px] text-zinc-500 text-center">
              Max file size: 5MB • Supported formats: JPG, PNG, WEBP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
