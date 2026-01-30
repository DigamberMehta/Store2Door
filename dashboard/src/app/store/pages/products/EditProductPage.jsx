import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Package, Upload, X, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { productAPI } from "../../../../services/store/api";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    category: "",
    categoryId: "",
    subcategory: "",
    price: "",
    retailPrice: "",
    originalPrice: "",
    originalRetailPrice: "",
    markupPercentage: 20,
    stockQuantity: 0,
    lowStockThreshold: 10,
    unit: "",
    weight: "",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isOnSale: false,
    saleEndDate: "",
    images: [],
    tags: [],
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  // When categories are loaded and we have a categoryId, set the selectedCategory
  useEffect(() => {
    if (categories.length > 0 && formData.categoryId && !selectedCategory) {
      const category = categories.find(
        (cat) => cat._id === formData.categoryId
      );
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [categories, formData.categoryId]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/categories");
      const categoriesData = response.data.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchSubcategories = async (slug) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/categories/${slug}/subcategories`
      );
      setSubcategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      // apiClient already returns response.data, so response is {success, data}
      const product = response.data;
      
      setFormData({
        name: product.name || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        category: product.category || "",
        categoryId: product.categoryId || "",
        subcategory: product.subcategory || "",
        price: product.price || "",
        retailPrice: product.retailPrice || "",
        originalPrice: product.originalPrice || "",
        originalRetailPrice: product.originalRetailPrice || "",
        markupPercentage: product.markupPercentage || 20,
        stockQuantity: product.stockQuantity || 0,
        lowStockThreshold: product.lowStockThreshold || 10,
        unit: product.unit || "",
        weight: product.weight || "",
        isActive: product.isActive !== undefined ? product.isActive : true,
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
        isFeatured: product.isFeatured || false,
        isOnSale: product.isOnSale || false,
        saleEndDate: product.saleEndDate ? product.saleEndDate.split('T')[0] : "",
        images: product.images || [],
        tags: product.tags || [],
      });

    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      navigate("/store/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory.slug);
    }
  }, [selectedCategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setFormData((prev) => ({
        ...prev,
        categoryId: category._id,
        category: category.name,
        subcategory: "",
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        // Upload to Cloudinary via your backend
        const response = await axios.post(
          `${API_BASE_URL}/upload/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('storeAuthToken')}`,
            },
          }
        );

        return {
          url: response.data.url,
          publicId: response.data.publicId,
          alt: file.name,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));

      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    toast.success('Image removed');
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const [primaryImage] = newImages.splice(index, 1);
      newImages.unshift(primaryImage);
      return { ...prev, images: newImages };
    });
    toast.success('Primary image updated');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        ...formData,
        price: parseFloat(formData.price),
        retailPrice: parseFloat(formData.retailPrice),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        originalRetailPrice: formData.originalRetailPrice ? parseFloat(formData.originalRetailPrice) : null,
        markupPercentage: parseFloat(formData.markupPercentage),
        stockQuantity: parseInt(formData.stockQuantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
      };

      await productAPI.update(id, updateData);
      toast.success("Product updated successfully!");
      navigate("/store/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/store/products")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Fresh Organic Apples"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Brief product description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Detailed product description"
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>
          
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                    <p className="text-sm text-gray-600">Uploading images...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload product images
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG up to 5MB each
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* Image Gallery */}
            {formData.images.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  {formData.images.length} image(s) • First image is the primary image
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative group rounded-lg overflow-hidden border-2 ${
                        index === 0
                          ? 'border-green-500 ring-2 ring-green-200'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `Product image ${index + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      
                      {/* Primary Badge */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          Primary
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                            title="Set as primary"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.images.length === 0 && (
              <div className="text-center py-8">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No images uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Category</option>
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading categories...</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!selectedCategory || subcategories.length === 0}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((subcat) => (
                  <option key={subcat._id} value={subcat.name}>
                    {subcat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (Your Cost) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Markup Percentage
              </label>
              <input
                type="number"
                name="markupPercentage"
                value={formData.markupPercentage}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="20"
              />
              <p className="text-sm text-gray-500 mt-1">
                Retail Price: R{(parseFloat(formData.price || 0) * (1 + parseFloat(formData.markupPercentage || 0) / 100)).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (if on sale)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale End Date
              </label>
              <input
                type="date"
                name="saleEndDate"
                value={formData.saleEndDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Inventory & Stock</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Alert when stock falls below this number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., kg, piece, pack"
              />
            </div>
          </div>

          {/* Stock Status Alert */}
          {parseInt(formData.stockQuantity) <= parseInt(formData.lowStockThreshold) && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Low Stock Warning
                </p>
                <p className="text-sm text-yellow-700">
                  Current stock ({formData.stockQuantity}) is at or below the threshold ({formData.lowStockThreshold}). Consider restocking soon.
                </p>
              </div>
            </div>
          )}

          {parseInt(formData.stockQuantity) === 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Out of Stock
                </p>
                <p className="text-sm text-red-700">
                  This product is currently out of stock and will be automatically hidden from customers.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight/Size
            </label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 500g, 1kg, 250ml"
            />
            <p className="text-xs text-gray-500 mt-1">
              Display weight or size for customers
            </p>
          </div>
        </div>

        {/* Status & Flags */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Product is Active</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Product is Available</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Featured Product</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isOnSale"
                checked={formData.isOnSale}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Product is On Sale</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/store/products")}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;