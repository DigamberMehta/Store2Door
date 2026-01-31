import { TrendingUp } from "lucide-react";

const TopProducts = ({ products }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">
          Top Selling Products
        </h2>
        <TrendingUp className="w-4 h-4 text-green-600" />
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {!products || products.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No products sold yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Your top selling products will appear here
            </p>
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">
                  #{index + 1}
                </span>
              </div>
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-600">
                  R{product.price?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {product.sold}
                </p>
                <p className="text-[10px] text-gray-500">sold</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopProducts;
