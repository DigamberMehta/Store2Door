import { HiOutlineSearch } from "react-icons/hi";
import ProductCard from "./ProductCard";

const ProductsGrid = ({
  subcategories,
  groupedProducts,
  fromSubcategory,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
}) => {
  if (subcategories.length === 0) {
    return (
      <div className="px-2 pt-4 pb-6">
        <div className="text-center py-12 px-4">
          <HiOutlineSearch className="text-5xl text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No products found</p>
          <p className="text-zinc-600 text-xs mt-1">
            This store doesn't have any products yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 pt-4 pb-6">
      {subcategories.map((subcategory) => (
        <div key={subcategory} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-black text-white">
              {subcategory}
              {fromSubcategory === subcategory && (
                <span className="ml-2 text-[10px] text-[rgb(49,134,22)] font-normal">
                  • From your search
                </span>
              )}
            </h2>
            <p className="text-[10px] text-zinc-500">
              {groupedProducts[subcategory].length} items
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {groupedProducts[subcategory].map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                cartItems={cartItems}
                onAddToCart={onAddToCart}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveFromCart={onRemoveFromCart}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsGrid;
