import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoryAPI, productAPI, storeAPI } from "../../../services/api";
import { useUserLocation } from "../../../hooks/useUserLocation";
import { useQuery } from "../../../hooks/useQuery";

const CategoryProductsView = ({ categoryName, onCategoryClick }) => {
  const [groupedStores, setGroupedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude } = useUserLocation();
  const navigate = useNavigate();

  // Use cached categories
  const { data: allCategoriesResponse, loading: categoriesLoading } = useQuery(
    () => categoryAPI.getAll(),
    "categories",
    { ttl: 10 * 60 * 1000 },
  );

  useEffect(() => {
    const fetchStores = async () => {
      if (categoriesLoading || !allCategoriesResponse) return;

      try {
        setLoading(true);

        const allCategories =
          allCategoriesResponse?.data || allCategoriesResponse;

        if (!allCategories || !Array.isArray(allCategories)) {
          setGroupedStores([]);
          setLoading(false);
          return;
        }

        // Find parent by matching name (case-insensitive)
        const parentCategory = allCategories.find(
          (cat) =>
            cat.name &&
            cat.name.toLowerCase().includes(categoryName.toLowerCase()),
        );

        if (!parentCategory) {
          setGroupedStores([]);
          setLoading(false);
          return;
        }

        // Step 2: Fetch subcategories using the dedicated subcategories endpoint
        try {
          const subcategoriesData = await categoryAPI.getSubcategories(
            parentCategory.slug,
          );

          // Handle different response formats
          const subcategories = subcategoriesData?.data || subcategoriesData;

          if (!subcategories || !Array.isArray(subcategories)) {
            setGroupedStores([]);
            setLoading(false);
            return;
          }

          if (subcategories.length === 0) {
            setGroupedStores([]);
            setLoading(false);
            return;
          }

          // Step 3: Fetch all products
          const params = {
            limit: 100,
          };

          if (latitude && longitude) {
            params.userLat = latitude;
            params.userLon = longitude;
          }

          const [productsResponse, storesResponse] = await Promise.all([
            productAPI.getAll(params),
            storeAPI.getAll(params),
          ]);

          if (
            !productsResponse?.data ||
            !Array.isArray(productsResponse.data)
          ) {
            setGroupedStores([]);
            setLoading(false);
            return;
          }

          const stores = storesResponse?.data || storesResponse || [];

          // Step 4: Group stores by subcategory based on products
          const groups = subcategories.map((subcat) => {
            const subcatId = subcat._id?.toString() || subcat._id;

            // Find products in this subcategory
            const categoryProducts = productsResponse.data.filter((product) => {
              const productCategoryId =
                product.categoryId?.toString() || product.categoryId;
              return productCategoryId === subcatId;
            });

            // Find stores that have these products
            const storeIds = new Set(
              categoryProducts.map((p) => p.storeId?.toString() || p.storeId),
            );
            const categoryStores = stores.filter((store) => {
              const storeId = store._id?.toString() || store._id;
              return storeIds.has(storeId);
            });

            return {
              category: subcat,
              stores: categoryStores.slice(0, 10),
              hasMore: categoryStores.length > 10,
            };
          });

          setGroupedStores(groups);
        } catch (subcatError) {
          console.error("Error fetching subcategories:", subcatError);
          setGroupedStores([]);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
        setGroupedStores([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName && !categoriesLoading) {
      fetchStores();
    }
  }, [categoryName, categoriesLoading]);

  if (loading) {
    return (
      <div className="px-2 py-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4">
            <div className="h-4 w-20 bg-white/10 rounded mb-2 animate-pulse"></div>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="bg-white/5 rounded-lg h-28 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groupedStores.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-white/60 text-lg">
          No stores found in {categoryName}
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {groupedStores.map((group) => (
        <div key={group.category._id} className="mb-5">
          {/* Level 2 Category Heading */}
          <div className="px-2 mb-2 flex items-center justify-between">
            <h3 className="text-white text-sm font-semibold flex items-center gap-1">
              <span>{group.category.name}</span>
            </h3>
            {group.hasMore && (
              <button
                onClick={() => onCategoryClick?.(group.category)}
                className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                View All
              </button>
            )}
          </div>

          {/* Stores Grid */}
          <div className="px-2">
            <div className="grid grid-cols-3 gap-1.5">
              {group.stores.map((store) => (
                <div
                  key={store._id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/20"
                  onClick={() => {
                    const storeName =
                      store.slug ||
                      store.name.toLowerCase().replace(/\s+/g, "-");
                    navigate(`/store/${storeName}`, {
                      state: {
                        searchContext: {
                          categoryId: group.category._id,
                          categoryName: group.category.name,
                          query: "",
                        },
                      },
                    });
                  }}
                >
                  {/* Store Photo */}
                  <div className="w-full aspect-square bg-white/5 overflow-hidden">
                    <img
                      src={
                        store.image ||
                        store.logo ||
                        "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80"
                      }
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Store Details */}
                  <div className="p-1">
                    <h4 className="text-white font-medium text-[10px] leading-tight mb-0.5 line-clamp-1">
                      {store.name}
                    </h4>
                    <p className="text-white/40 text-[8px] truncate">
                      {store.address?.city || store.location || "Near You"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryProductsView;
