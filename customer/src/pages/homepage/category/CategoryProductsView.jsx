import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoryAPI, productAPI, storeAPI } from "../../../services/api";
import { useUserLocation } from "../../../hooks/useUserLocation";
import StoreCard from "../store/StoreCard";

const CategoryProductsView = ({ categoryName, onCategoryClick }) => {
  const [groupedStores, setGroupedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude } = useUserLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        console.log('🔍 CategoryProductsView - Fetching for:', categoryName);

        // Step 1: Get all level 1 categories to find parent
        const allCategoriesResponse = await categoryAPI.getAll();
        const allCategories = allCategoriesResponse?.data || allCategoriesResponse;
        
        if (!allCategories || !Array.isArray(allCategories)) {
          console.log('❌ Invalid categories response');
          setGroupedStores([]);
          setLoading(false);
          return;
        }

        // Find parent by matching name (case-insensitive)
        const parentCategory = allCategories.find(
          cat => cat.name && cat.name.toLowerCase().includes(categoryName.toLowerCase())
        );

        if (!parentCategory) {
          console.log(`❌ No parent category found matching "${categoryName}"`);
          console.log('Available categories:', allCategories.map(c => c.name));
          setGroupedStores([]);
          setLoading(false);
          return;
        }

        console.log('✅ Found parent category:', parentCategory.name, 'ID:', parentCategory._id, 'Slug:', parentCategory.slug);

        // Step 2: Fetch subcategories using the dedicated subcategories endpoint
        console.log('🔍 Fetching subcategories for parent slug:', parentCategory.slug);
        
        try {
          const subcategoriesData = await categoryAPI.getSubcategories(parentCategory.slug);
          console.log('📦 Subcategories response:', subcategoriesData);
          
          // Handle different response formats
          const subcategories = subcategoriesData?.data || subcategoriesData;
          
          if (!subcategories || !Array.isArray(subcategories)) {
            console.log('❌ Invalid subcategories format:', subcategoriesData);
            setGroupedStores([]);
            setLoading(false);
            return;
          }
          
          console.log(`📊 Found ${subcategories.length} subcategories:`, subcategories.map(c => ({ 
            name: c.name, 
            slug: c.slug,
            parentId: c.parentId
          })));

          if (subcategories.length === 0) {
            console.log('❌ No subcategories found');
            setGroupedStores([]);
            setLoading(false);
            return;
          }

          console.log(`📊 Found ${subcategories.length} subcategories:`, subcategories.map(c => ({ 
            name: c.name, 
            slug: c.slug,
            productCount: c.productCount
          })));

          // Step 3: Fetch all products
          const params = {
            limit: 100,
          };

          if (latitude && longitude) {
            params.userLat = latitude;
            params.userLon = longitude;
          }

          console.log('🌐 Fetching products and stores...');
          const [productsResponse, storesResponse] = await Promise.all([
            productAPI.getAll(params),
            storeAPI.getAll(params)
          ]);
          
          if (!productsResponse?.data || !Array.isArray(productsResponse.data)) {
            console.log('❌ No products in response');
            setGroupedStores([]);
            setLoading(false);
            return;
          }

          const stores = storesResponse?.data || storesResponse || [];
          console.log(`📦 Total products fetched: ${productsResponse.data.length}`);
          console.log(`🏪 Total stores fetched: ${stores.length}`);

          // Step 4: Group stores by subcategory based on products
          const groups = subcategories.map(subcat => {
            const subcatId = subcat._id?.toString() || subcat._id;
            
            console.log(`🔍 "${subcat.name}" (ID: ${subcatId})`);

            // Find products in this subcategory
            const categoryProducts = productsResponse.data.filter(product => {
              const productCategoryId = product.categoryId?.toString() || product.categoryId;
              return productCategoryId === subcatId;
            });

            console.log(`   📦 Found ${categoryProducts.length} products in "${subcat.name}"`);

            // Find stores that have these products
            const storeIds = new Set(categoryProducts.map(p => p.storeId?.toString() || p.storeId));
            const categoryStores = stores.filter(store => {
              const storeId = store._id?.toString() || store._id;
              return storeIds.has(storeId);
            });

            console.log(`   ✅ Found ${categoryStores.length} stores for "${subcat.name}"`);

            return {
              category: subcat,
              stores: categoryStores.slice(0, 10),
              hasMore: categoryStores.length > 10
            };
          });

          console.log(`✅ Created ${groups.length} groups with stores`);
          setGroupedStores(groups);
        } catch (subcatError) {
          console.error('Error fetching subcategories:', subcatError);
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

    if (categoryName) {
      fetchStores();
    }
  }, [categoryName]); // Only depend on categoryName to prevent multiple calls

  if (loading) {
    return (
      <div className="px-4 py-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-8">
            <div className="h-6 w-32 bg-white/10 rounded mb-4 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="bg-white/5 rounded-lg h-64 animate-pulse"></div>
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
        <p className="text-white/60 text-lg">No stores found in {categoryName}</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {groupedStores.map((group) => (
        <div key={group.category._id} className="mb-8">
          {/* Level 2 Category Heading */}
          <div className="px-4 mb-4 flex items-center justify-between">
            <h3 className="text-white text-xl font-semibold flex items-center gap-2">
              <span>{group.category.icon || '📦'}</span>
              <span>{group.category.name}</span>
            </h3>
            {group.hasMore && (
              <button 
                onClick={() => onCategoryClick?.(group.category)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All →
              </button>
            )}
          </div>

          {/* Stores Grid */}
          <div className="px-4">
            <div className="grid grid-cols-2 gap-3">
              {group.stores.map((store) => (
                <div
                  key={store._id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/20"
                  onClick={() => {
                    console.log('🏪 Navigating to store with categoryId:', group.category._id);
                    console.log('🏪 Category name:', group.category.name);
                    
                    const storeName = store.slug || store.name.toLowerCase().replace(/\s+/g, '-');
                    navigate(`/store/${storeName}`, {
                      state: {
                        searchContext: {
                          categoryId: group.category._id,
                          categoryName: group.category.name,
                          query: ""
                        }
                      }
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
                  <div className="p-3">
                    <h4 className="text-white font-semibold text-sm mb-1 truncate">
                      {store.name}
                    </h4>
                    <p className="text-white/60 text-xs truncate">
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
