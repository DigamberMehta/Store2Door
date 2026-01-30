import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const ProductImagesSection = ({
  images,
  handleImageChange,
  addImage,
  removeImage,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check if adding these files would exceed 5 images total
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const token = localStorage.getItem("storeAuthToken");
      const response = await axios.post(
        "http://localhost:3000/api/managers/upload/product-images",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const uploadedImages = response.data.data;
        
        // Add uploaded images to the form
        uploadedImages.forEach((img, index) => {
          const newIndex = images.length + index;
          if (newIndex === 0) {
            // First image should be primary
            handleImageChange(newIndex, "url", img.url);
            handleImageChange(newIndex, "alt", img.alt);
            handleImageChange(newIndex, "isPrimary", true);
          } else {
            addImage();
            // Use setTimeout to ensure the new image slot is created
            setTimeout(() => {
              handleImageChange(newIndex, "url", img.url);
              handleImageChange(newIndex, "alt", img.alt);
              handleImageChange(newIndex, "isPrimary", false);
            }, 0);
          }
        });

        toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset file input
    }
  };

  return (
    <section className="bg-white border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload up to 5 product images. First image will be the primary image.
        </p>
      </div>

      {/* File Upload Area */}
      <div className="mb-4">
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            uploading
              ? "border-gray-300 bg-gray-50 cursor-not-allowed"
              : "border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-green-600 mb-2" />
                <p className="mb-1 text-sm text-gray-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, or WEBP (MAX. 5MB per image)
                </p>
              </>
            )}
          </div>
          <input
            id="image-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading || images.length >= 5}
          />
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative group border-2 rounded-lg overflow-hidden ${
                image.isPrimary
                  ? "border-green-500 ring-2 ring-green-200"
                  : "border-gray-200"
              }`}
            >
              {/* Image Preview */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.alt || `Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
                  Primary
                </div>
              )}

              {/* Remove Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Alt Text Input */}
              <div className="p-2">
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) =>
                    handleImageChange(index, "alt", e.target.value)
                  }
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="Image description (optional)"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No images uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload at least one product image above
          </p>
        </div>
      )}
    </section>
  );
};

export default ProductImagesSection;
