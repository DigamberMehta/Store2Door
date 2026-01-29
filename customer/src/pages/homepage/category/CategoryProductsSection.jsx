import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { productAPI, categoryAPI } from "../../../services/api";
import { useUserLocation } from "../../../hooks/useUserLocation";

const CategoryProductsSection = ({
  parentSlug,
  title,
  onCategoryClick,
  selectedCategory,
  showTitle = true,
}) => {
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude } = useUserLocation();

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);

        // Fetch all categories to get Level 2 categories under the parent
        const categoriesResponse = await categoryAPI.getAll();

        if (!categoriesResponse || !Array.isArray(categoriesResponse)) {
          console.error("Invalid categories response");
          return;
        }

        // Find parent category
        const parentCategory = categoriesResponse.find(
          (cat) => cat.slug === parentSlug && cat.level === 1,
        );

        if (!parentCategory) {
          return;
        }

        // Get Level 2 subcategories
        const subcategories = categoriesResponse.filter(
          (cat) => cat.level === 2 && cat.parent?._id === parentCategory._id,
        );

        // Fetch products for each subcategory
        const groups = await Promise.all(
          subcategories.map(async (subcat) => {
            try {
              const params = {
                limit: 6,
                category: subcat.slug,
              };

              // Add location if available
              if (latitude && longitude) {
                params.userLat = latitude;
                params.userLon = longitude;
              }

              const response = await productAPI.getAll(params);

              return {
                category: subcat,
                products: response?.data || [],
              };
            } catch (error) {
              console.error(
                `Error fetching products for ${subcat.name}:`,
                error,
              );
              return {
                category: subcat,
                products: [],
              };
            }
          }),
        );

        // Filter out categories with no products
        const groupsWithProducts = groups.filter(
          (group) => group.products.length > 0,
        );
        setCategoryGroups(groupsWithProducts);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [parentSlug, latitude, longitude, selectedCategory]);

  if (loading) {
    return (
      <div className="mb-6 px-3">
        <div className="h-6 bg-white/10 rounded w-48 mb-3 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-white/5 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (categoryGroups.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 px-3">
      {/* Main Section Title - only show when showTitle is true */}
      {showTitle && (
        <h2 className="text-white font-bold text-lg mb-4">{title}</h2>
      )}

      {categoryGroups.map((group) => (
        <div key={group.category._id} className="mb-6">
          {/* Level 2 Category as Main Section Heading */}
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`text-white font-semibold ${showTitle ? "text-base" : "text-lg"}`}
            >
              {group.category.name}
            </h3>
            <button
              onClick={() => onCategoryClick?.(group.category)}
              className="flex items-center gap-1 text-[rgb(49,134,22)] text-xs font-medium"
            >
              See All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Products Grid (Level 3 - actual products) */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {group.products.slice(0, 4).map((product) => (
              <div
                key={product._id}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
              >
                {/* Product Image */}
                <div className="aspect-square bg-white/5 relative">
                  <img
                    src={product.images?.[0] || "/placeholder-product.png"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2">
                  <h4 className="text-white text-xs font-medium line-clamp-1 mb-1">
                    {product.name}
                  </h4>
                  <p className="text-white/40 text-[10px] mb-2">
                    {product.unit}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-bold text-sm">
                        ₹{product.finalPrice || product.price}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-white/40 text-[10px] line-through ml-1">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                    <button className="bg-[rgb(49,134,22)] text-white text-[10px] font-medium px-3 py-1 rounded-lg active:scale-95 transition-transform">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryProductsSection;
