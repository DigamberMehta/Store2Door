const ProductImagesSection = ({
  images,
  handleImageChange,
  handleImageFileChange,
  addImage,
  removeImage,
}) => {
  return (
    <section className="bg-white border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Product Images
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload product images. First image will be the primary image.
      </p>
      {images.map((image, index) => (
        <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {index === 0 ? "Primary Image *" : `Image ${index + 1}`}
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleImageFileChange(index, e.target.files[0])}
                required={index === 0 && !image.file && !image.url}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {image.preview && (
                <div className="mt-2">
                  <img
                    src={image.preview}
                    alt={image.alt || "Preview"}
                    className="h-20 w-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>
            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Description
              </label>
              <input
                type="text"
                value={image.alt}
                onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Image description"
              />
            </div>
            <div className="col-span-2 flex items-end">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addImage}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
      >
        + Add Image
      </button>
    </section>
  );
};

export default ProductImagesSection;
