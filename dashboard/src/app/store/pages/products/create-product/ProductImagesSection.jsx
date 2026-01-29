const ProductImagesSection = ({
  images,
  handleImageChange,
  addImage,
  removeImage,
}) => {
  return (
    <section className="bg-white border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Product Images
      </h2>
      {images.map((image, index) => (
        <div key={index} className="grid grid-cols-12 gap-4 mb-3">
          <div className="col-span-6">
            <input
              type="url"
              value={image.url}
              onChange={(e) => handleImageChange(index, "url", e.target.value)}
              required={index === 0}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="col-span-4">
            <input
              type="text"
              value={image.alt}
              onChange={(e) => handleImageChange(index, "alt", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Image description"
            />
          </div>
          <div className="col-span-2">
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
