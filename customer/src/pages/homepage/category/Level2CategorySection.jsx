import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { productAPI, categoryAPI } from "../../../services/api";
import { useUserLocation } from "../../../hooks/useUserLocation";
import { useQuery } from "../../../hooks/useQuery";

const Level2CategorySection = ({ parentSlug, onCategoryClick }) => {
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude } = useUserLocation();

  // Use cached categories
  const { data: categoriesResponse, loading: categoriesLoading } = useQuery(
    () => categoryAPI.getAll(),
    "categories",
    { ttl: 10 * 60 * 1000 },
  );

  console.log(
    "🔍 Level2CategorySection rendering with parentSlug:",
    parentSlug,
  );

  useEffect(() => {
    const fetchCategoryData = async () => {
      // Wait for categories to load
      if (categoriesLoading || !categoriesResponse) {
        return;
      }

      try {
        setLoading(true);
        console.log("📦 Fetching categories for parentSlug:", parentSlug);

        console.log("✅ Categories response:", categoriesResponse);

        if (!Array.isArray(categoriesResponse)) {
          console.log("❌ Invalid categories response");
          setLoading(false);
          return;
        }

        // Find parent category
        const parentCategory = categoriesResponse.find(
          (cat) => cat.slug === parentSlug && cat.level === 1,
        );

        if (!parentCategory) {
          console.log(`Parent category with slug "${parentSlug}" not found`);
          console.log(
            "Available level 1 categories:",
            categoriesResponse.filter((c) => c.level === 1).map((c) => c.slug),
          );
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
                limit: 4,
                category: subcat.slug,
              };

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
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [parentSlug, latitude, longitude, categoriesResponse, categoriesLoading]);

  if (loading || categoriesLoading) {
    return (
      <div className="mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-6 px-3">
            <div className="h-32 bg-white/5 rounded-lg mb-3 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="h-40 bg-white/5 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categoryGroups.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-white/60">No categories available</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {categoryGroups.map((group) => (
        <div key={group.category._id} className="mb-6">
          {/* Level 2 Category Card */}
          <div
            onClick={() => onCategoryClick?.(group.category)}
            className="mx-3 mb-4 rounded-2xl overflow-hidden relative cursor-pointer active:scale-98 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${group.category.color || "#3b82f6"} 0%, ${group.category.color || "#3b82f6"}dd 100%)`,
            }}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">
                  {group.category.name}
                </h3>
                <p className="text-white/80 text-xs">
                  {group.products.length}+ products
                </p>
              </div>
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm flex-shrink-0">
                <img
                  src={group.category.image || "/placeholder-category.png"}
                  alt={group.category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <ChevronRight className="w-5 h-5 text-white/60" />
            </div>
          </div>

          {/* Products Grid */}
          {group.products.length > 0 && (
            <div className="px-3">
              <div className="grid grid-cols-2 gap-3">
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
          )}
        </div>
      ))}
    </div>
  );
};

export default Level2CategorySection;
