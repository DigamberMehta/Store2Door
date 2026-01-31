import { Upload, X, Image as ImageIcon, Star } from "lucide-react";
import toast from "react-hot-toast";

const ProductImagesSection = ({
  images,
  handleImageChange,
  handleImageFileChange,
  addImage,
  removeImage,
  setPrimaryImage,
}) => {
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check if adding these files would exceed 5 images total
    const currentImageCount = images.filter(
      (img) => img.url || img.preview,
    ).length;
    if (currentImageCount + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      e.target.value = "";
      return;
    }

    // Add each file to the form
    files.forEach((file) => {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      // Find first empty slot or add new one
      const emptyIndex = images.findIndex(
        (image) => !image.url && !image.preview,
      );
      if (emptyIndex !== -1) {
        // Fill empty slot
        if (handleImageFileChange) {
          handleImageFileChange(emptyIndex, file);
        } else {
          // Fallback for edit page without handleImageFileChange
          const preview = URL.createObjectURL(file);
          handleImageChange(emptyIndex, "file", file);
          handleImageChange(emptyIndex, "preview", preview);
          handleImageChange(emptyIndex, "url", "");
        }
        if (emptyIndex === 0 && !images.some((i) => i.isPrimary)) {
          handleImageChange(emptyIndex, "isPrimary", true);
        }
      } else {
        // Add new image slot
        addImage();
        const newIndex = images.length;
        setTimeout(() => {
          if (handleImageFileChange) {
            handleImageFileChange(newIndex, file);
          } else {
            const preview = URL.createObjectURL(file);
            handleImageChange(newIndex, "file", file);
            handleImageChange(newIndex, "preview", preview);
            handleImageChange(newIndex, "url", "");
          }
          handleImageChange(
            newIndex,
            "isPrimary",
            newIndex === 0 && !images.some((i) => i.isPrimary),
          );
        }, 10);
      }
    });

    toast.success(`${files.length} image(s) selected`);
    e.target.value = ""; // Reset file input
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
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 text-green-600 mb-2" />
            <p className="mb-1 text-sm text-gray-700">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, or WEBP (MAX. 5MB per image)
            </p>
          </div>
          <input
            id="image-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={
              images.filter((img) => img.url || img.preview).length >= 5
            }
          />
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.filter((img) => img.url || img.preview).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {images
            .filter((img) => img.url || img.preview)
            .map((image, displayIndex) => {
              const actualIndex = images.findIndex((img) => img === image);
              const imageSrc = image.preview || image.url;
              return (
                <div
                  key={actualIndex}
                  className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                    image.isPrimary
                      ? "border-green-500 ring-2 ring-green-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Image Preview */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={image.alt || `Product image ${displayIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", imageSrc);
                        e.target.style.display = "none";
                      }}
                    />

                    {/* New Image Badge */}
                    {image.file && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                        New
                      </div>
                    )}

                    {/* Hover overlay with controls */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"></div>

                    {/* Action buttons */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2 z-10">
                      {/* Set as Primary Button */}
                      {!image.isPrimary && setPrimaryImage && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(actualIndex)}
                          className="bg-white text-gray-700 p-2 rounded-full hover:bg-green-500 hover:text-white transition-colors shadow-lg"
                          title="Set as primary"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(actualIndex)}
                        className="bg-white text-red-600 p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors shadow-lg"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                      <Star className="w-3 h-3 fill-white" />
                      Primary
                    </div>
                  )}

                  {/* Alt Text Input */}
                  <div className="p-2 bg-white">
                    <input
                      type="text"
                      value={image.alt || ""}
                      onChange={(e) =>
                        handleImageChange(actualIndex, "alt", e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Image description"
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {images.filter((img) => img.url || img.preview).length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No images selected yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Select at least one product image above
          </p>
        </div>
      )}
    </section>
  );
};

export default ProductImagesSection;
