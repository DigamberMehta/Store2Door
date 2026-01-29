import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import testProducts from "./testData.json";
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

const CreateProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);

  // Form state with ALL fields from Product schema
  const [formData, setFormData] = useState({
    // REQUIRED Basic Information
    name: "",
    description: "",
    category: "",
    categoryId: "",
    price: "", // This will be sent as wholesalePrice to backend

    // Optional Basic Info
    shortDescription: "",
    subcategory: "",
    tags: "",

    // Pricing (currency is ZAR by default)
    originalPrice: "",
    currency: "ZAR",

    // Images (at least 1 required)
    images: [{ url: "", alt: "", isPrimary: true }],

    // REQUIRED Inventory
    inventory: {
      quantity: "",
      lowStockThreshold: "10",
      sku: "",
      barcode: "",
    },

    // Food/Dietary Attributes
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isOrganic: false,
    isHalal: false,
    isKosher: false,
    isDairyFree: false,
    isNutFree: false,

    // Safety & Age Restrictions
    minimumAge: "",
    requiresIDVerification: false,
    isPrescriptionRequired: false,
    isFragile: false,

    // Availability
    isActive: true,
    isAvailable: true,
    preparationTime: "15",

    // Promotions
    isFeatured: false,
    isOnSale: false,
    saleStartDate: "",
    saleEndDate: "",

    // Specifications
    specifications: {
      brand: "",
      model: "",
      color: "",
      size: "",
      weight: "",
      material: "",
      warranty: "",
    },

    // Nutrition (for food)
    nutrition: {
      calories: "",
      protein: "",
      carbohydrates: "",
      fat: "",
      sugar: "",
      servingSize: "",
      servingsPerContainer: "",
    },
  });

  // Dynamic Key Features state
  const [keyFeatures, setKeyFeatures] = useState([]);

  // Dynamic Custom Specifications state
  const [customSpecs, setCustomSpecs] = useState([]);

  // Product Variants state
  const [variants, setVariants] = useState([]);

  const fillTestData = (productType) => {
    const testData = testProducts[productType];
    if (!testData) return;

    // Find matching category if possible
    let categoryToUse = formData.categoryId;
    let categoryNameToUse = formData.category;

    if (productType === "electronics") {
      const electronicsCategory = categories.find((c) =>
        c.name.toLowerCase().includes("electronic"),
      );
      if (electronicsCategory) {
        categoryToUse = electronicsCategory._id;
        categoryNameToUse = electronicsCategory.name;
        setSelectedCategory(electronicsCategory);
      }
    } else if (productType === "groceries") {
      const groceryCategory = categories.find(
        (c) =>
          c.name.toLowerCase().includes("grocery") ||
          c.name.toLowerCase().includes("food"),
      );
      if (groceryCategory) {
        categoryToUse = groceryCategory._id;
        categoryNameToUse = groceryCategory.name;
        setSelectedCategory(groceryCategory);
      }
    }

    setFormData({
      ...formData,
      ...testData,
      categoryId: categoryToUse,
      category: categoryNameToUse,
    });

    // Always reset these arrays to avoid carrying over data from previous test fills
    setKeyFeatures(testData.keyFeatures || []);
    setCustomSpecs(testData.customSpecs || []);
    setVariants(testData.variants || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { url: "", alt: "", isPrimary: false }],
    }));
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        wholesalePrice: parseFloat(formData.price), // Store manager's price (before markup)
        price: parseFloat(formData.price), // Backward compatibility
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
        images: formData.images.filter((img) => img.url),
      };

      const token = localStorage.getItem("storeAuthToken");
      const response = await axios.post(
        "http://localhost:3000/api/managers/products",
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        alert("Product created successfully!");
        navigate("/store/products");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // Smart category detection for food vs non-food
  const isFoodCategory = () => {
    if (!selectedCategory) return false;

    const categoryName = selectedCategory.name.toLowerCase();
    const categorySlug = selectedCategory.slug?.toLowerCase() || "";
    const businessTypes = selectedCategory.businessTypes || [];

    // Check if it's a food-related category
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Product
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the product details below. Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          </div>

          {/* Test Data Buttons */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 font-medium text-right">
              Quick Fill Test Data:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillTestData("electronics")}
                className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                📱 Electronics
              </button>
              <button
                type="button"
                onClick={() => fillTestData("groceries")}
                className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                🥚 Groceries
              </button>
              <button
                type="button"
                onClick={() => fillTestData("clothing")}
                className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                👕 Clothing
              </button>
            </div>
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
            addImage={addImage}
            removeImage={removeImage}
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

          <FormActions loading={loading} />
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
