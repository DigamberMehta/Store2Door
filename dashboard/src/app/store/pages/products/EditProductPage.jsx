import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BasicInformationSection from "./create-product/BasicInformationSection";
import PricingSection from "./create-product/PricingSection";
import ProductImagesSection from "./create-product/ProductImagesSection";
import InventorySection from "./create-product/InventorySection";
import SpecificationsSection from "./create-product/SpecificationsSection";
import DietaryAttributesSection from "./create-product/DietaryAttributesSection";
import NutritionSection from "./create-product/NutritionSection";
import SafetyRestrictionsSection from "./create-product/SafetyRestrictionsSection";
import AvailabilityPromotionsSection from "./create-product/AvailabilityPromotionsSection";
import VariantsSection from "./create-product/VariantsSection";
import FormActions from "./create-product/FormActions";
import { productAPI } from "../../../../services/store/api/product.api";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    categoryId: "",
    price: "",
    shortDescription: "",
    subcategory: "",
    tags: "",
    originalPrice: "",
    currency: "ZAR",
    images: [{ url: "", alt: "", isPrimary: true }],
    inventory: {
      quantity: "",
      lowStockThreshold: "10",
      sku: "",
      barcode: "",
    },
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isOrganic: false,
    isHalal: false,
    isKosher: false,
    isDairyFree: false,
    isNutFree: false,
    minimumAge: "",
    requiresIDVerification: false,
    isPrescriptionRequired: false,
    isFragile: false,
    isActive: true,
    isAvailable: true,
    preparationTime: "15",
    isFeatured: false,
    isOnSale: false,
    saleStartDate: "",
    saleEndDate: "",
    specifications: {
      brand: "",
      model: "",
      color: "",
      size: "",
      weight: "",
      material: "",
      warranty: "",
    },
    nutrition: {
      calories: "",
      protein: "",
      carbohydrates: "",
      fat: "",
      fiber: "",
      sugar: "",
      sodium: "",
      servingSize: "",
      servingsPerContainer: "",
    },
  });

  const [keyFeatures, setKeyFeatures] = useState([]);
  const [customSpecs, setCustomSpecs] = useState([]);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchProduct();
    }
  }, [id, categories]);

  const fetchProduct = async () => {
    try {
      setFetchingProduct(true);
      const token = localStorage.getItem("storeAuthToken");
      const response = await axios.get(
        `http://localhost:3000/api/managers/products/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        const product = response.data.data;

        // Set selected category first
        if (product.categoryId && categories.length > 0) {
          const category = categories.find((c) => c._id === product.categoryId);
          if (category) {
            setSelectedCategory(category);
          }
        }

        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          categoryId: product.categoryId || "",
          price: product.wholesalePrice || product.price || "",
          shortDescription: product.shortDescription || "",
          subcategory: product.subcategory || "",
          tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
          originalPrice:
            product.originalWholesalePrice || product.originalPrice || "",
          currency: product.currency || "ZAR",
          images:
            product.images?.length > 0
              ? product.images.map((img) => ({
                  ...img,
                  file: null,
                  preview: null,
                }))
              : [
                  {
                    url: "",
                    alt: "",
                    isPrimary: true,
                    file: null,
                    preview: null,
                  },
                ],
          inventory: {
            quantity: product.inventory?.quantity || "",
            lowStockThreshold: product.inventory?.lowStockThreshold || "10",
            sku: product.inventory?.sku || "",
            barcode: product.inventory?.barcode || "",
          },
          isVegetarian: product.isVegetarian || false,
          isVegan: product.isVegan || false,
          isGlutenFree: product.isGlutenFree || false,
          isOrganic: product.isOrganic || false,
          isHalal: product.isHalal || false,
          isKosher: product.isKosher || false,
          isDairyFree: product.isDairyFree || false,
          isNutFree: product.isNutFree || false,
          minimumAge: product.minimumAge || "",
          requiresIDVerification: product.requiresIDVerification || false,
          isPrescriptionRequired: product.isPrescriptionRequired || false,
          isFragile: product.isFragile || false,
          isActive: product.isActive !== undefined ? product.isActive : true,
          isAvailable:
            product.isAvailable !== undefined ? product.isAvailable : true,
          preparationTime: product.preparationTime || "15",
          isFeatured: product.isFeatured || false,
          isOnSale: product.isOnSale || false,
          saleStartDate: product.saleStartDate
            ? new Date(product.saleStartDate).toISOString().split("T")[0]
            : "",
          saleEndDate: product.saleEndDate
            ? new Date(product.saleEndDate).toISOString().split("T")[0]
            : "",
          specifications: {
            brand: product.specifications?.brand || "",
            model: product.specifications?.model || "",
            color: product.specifications?.color || "",
            size: product.specifications?.size || "",
            weight: product.specifications?.weight || "",
            material: product.specifications?.material || "",
            warranty: product.specifications?.warranty || "",
          },
          nutrition: {
            calories: product.nutrition?.calories || "",
            protein: product.nutrition?.protein || "",
            carbohydrates: product.nutrition?.carbohydrates || "",
            fat: product.nutrition?.fat || "",
            fiber: product.nutrition?.fiber || "",
            sugar: product.nutrition?.sugar || "",
            sodium: product.nutrition?.sodium || "",
            servingSize: product.nutrition?.servingSize || "",
            servingsPerContainer: product.nutrition?.servingsPerContainer || "",
          },
        });

        setKeyFeatures(product.specifications?.keyFeatures || []);
        setCustomSpecs(product.specifications?.customSpecs || []);
        setVariants(product.variants || []);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
    } finally {
      setFetchingProduct(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory.slug);
    }
  }, [selectedCategory]);

  const fetchSubcategories = async (slug) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/categories/${slug}/subcategories`,
      );
      setSubcategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categories.find((c) => c._id === categoryId);
    setSelectedCategory(category);
    setFormData((prev) => ({
      ...prev,
      categoryId: categoryId,
      category: category?.name || "",
      subcategory: "",
    }));
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleImageFileChange = (index, file) => {
    if (!file) return;

    const newImages = [...formData.images];
    const preview = URL.createObjectURL(file);
    newImages[index] = {
      ...newImages[index],
      file: file,
      preview: preview,
      url: "", // Clear URL when file is selected
    };
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        { url: "", alt: "", isPrimary: false, file: null, preview: null },
      ],
    }));
  };

  const removeImage = (index) => {
    // Clean up preview URL to avoid memory leaks
    if (formData.images[index].preview) {
      URL.revokeObjectURL(formData.images[index].preview);
    }
    const newImages = formData.images.filter((_, i) => i !== index);
    // If we removed the primary image, make the first remaining image primary
    if (newImages.length > 0 && formData.images[index].isPrimary) {
      newImages[0].isPrimary = true;
    }
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const setPrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate images (check for either url or preview/file)
      const validImages = formData.images.filter(
        (img) => img.url || img.preview || img.file,
      );
      if (validImages.length === 0) {
        toast.error("Please add at least one product image");
        setLoading(false);
        return;
      }

      // Upload new images first
      const imagesToUpload = formData.images.filter((img) => img.file);
      let uploadedImages = [];

      if (imagesToUpload.length > 0) {
        const uploadFormData = new FormData();
        imagesToUpload.forEach((img) => {
          uploadFormData.append("images", img.file);
        });

        try {
          const token = localStorage.getItem("storeAuthToken");
          const uploadResponse = await axios.post(
            "http://localhost:3000/api/managers/upload/product-images",
            uploadFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            },
          );

          if (uploadResponse.data.success) {
            uploadedImages = uploadResponse.data.data;
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Failed to upload new images");
          setLoading(false);
          return;
        }
      }

      // Merge existing images with newly uploaded ones
      let uploadIndex = 0;
      const finalImages = formData.images
        .filter((img) => img.url || img.file)
        .map((img) => {
          if (img.file) {
            // Replace with uploaded image data
            const uploadedImg = uploadedImages[uploadIndex++];
            return {
              url: uploadedImg.url,
              alt: img.alt || uploadedImg.alt,
              isPrimary: img.isPrimary,
            };
          }
          // Keep existing image
          return {
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
          };
        });

      // Ensure at least one image is marked as primary
      const hasPrimary = finalImages.some((img) => img.isPrimary);
      if (!hasPrimary && finalImages.length > 0) {
        finalImages[0].isPrimary = true;
      }

      const productData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        wholesalePrice: parseFloat(formData.price),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        preparationTime: parseInt(formData.preparationTime),
        minimumAge: formData.minimumAge
          ? parseInt(formData.minimumAge)
          : undefined,
        inventory: {
          ...formData.inventory,
          quantity: parseInt(formData.inventory.quantity),
          lowStockThreshold: parseInt(formData.inventory.lowStockThreshold),
        },
        specifications: {
          ...formData.specifications,
          weight: formData.specifications.weight
            ? parseFloat(formData.specifications.weight)
            : undefined,
          keyFeatures: keyFeatures.filter((f) => f.key && f.value),
          customSpecs: customSpecs.filter((s) => s.name && s.value),
        },
        variants: variants
          .filter((v) => v.name && v.value)
          .map((v) => ({
            ...v,
            priceModifier: parseFloat(v.priceModifier) || 0,
          })),
        nutrition: Object.keys(formData.nutrition).reduce((acc, key) => {
          const value = formData.nutrition[key];
          if (value !== "") {
            acc[key] = ["servingSize"].includes(key)
              ? value
              : parseFloat(value) || 0;
          }
          return acc;
        }, {}),
        images: finalImages,
      };

      const token = localStorage.getItem("storeAuthToken");
      const response = await axios.put(
        `http://localhost:3000/api/managers/products/${id}`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        navigate("/store/products");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const isFoodCategory = () => {
    if (!selectedCategory) return false;

    const categoryName = selectedCategory.name.toLowerCase();
    const categorySlug = selectedCategory.slug?.toLowerCase() || "";
    const businessTypes = selectedCategory.businessTypes || [];

    const foodKeywords = [
      "grocery",
      "food",
      "snacks",
      "dairy",
      "meat",
      "seafood",
      "fruits",
      "vegetables",
      "bakery",
      "bread",
      "beverage",
      "drinks",
      "meal",
      "kitchen",
      "cooking",
      "condiment",
      "spice",
      "breakfast",
      "frozen",
      "fresh",
      "organic",
      "deli",
      "dessert",
      "candy",
      "chocolate",
    ];

    const isFood = foodKeywords.some(
      (keyword) =>
        categoryName.includes(keyword) ||
        categorySlug.includes(keyword) ||
        businessTypes.includes("grocery") ||
        businessTypes.includes("restaurant"),
    );

    return isFood;
  };

  const showFoodSections = isFoodCategory();

  if (fetchingProduct) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 text-green-600 animate-spin mb-2" />
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Edit Product</h1>
            <p className="text-xs text-gray-500 mt-1">
              Update product details below. Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          </div>
        </div>
      </div>

      <div className="">
        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInformationSection
            formData={formData}
            handleInputChange={handleInputChange}
            categories={categories}
            subcategories={subcategories}
            selectedCategory={selectedCategory}
            handleCategoryChange={handleCategoryChange}
          />

          <PricingSection
            formData={formData}
            handleInputChange={handleInputChange}
          />

          <VariantsSection variants={variants} setVariants={setVariants} />

          <ProductImagesSection
            images={formData.images}
            handleImageChange={handleImageChange}
            handleImageFileChange={handleImageFileChange}
            addImage={addImage}
            removeImage={removeImage}
            setPrimaryImage={setPrimaryImage}
          />

          <InventorySection
            inventory={formData.inventory}
            handleNestedChange={handleNestedChange}
          />

          <SpecificationsSection
            specifications={formData.specifications}
            handleNestedChange={handleNestedChange}
            keyFeatures={keyFeatures}
            setKeyFeatures={setKeyFeatures}
            customSpecs={customSpecs}
            setCustomSpecs={setCustomSpecs}
          />

          {showFoodSections && (
            <>
              <DietaryAttributesSection
                formData={formData}
                handleInputChange={handleInputChange}
              />

              <NutritionSection
                nutrition={formData.nutrition}
                handleNestedChange={handleNestedChange}
              />
            </>
          )}

          <SafetyRestrictionsSection
            formData={formData}
            handleInputChange={handleInputChange}
          />

          <AvailabilityPromotionsSection
            formData={formData}
            handleInputChange={handleInputChange}
          />

          <FormActions loading={loading} isEdit={true} />
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
