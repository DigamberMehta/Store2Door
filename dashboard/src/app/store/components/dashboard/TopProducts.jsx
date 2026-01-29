import { TrendingUp } from "lucide-react";

const TopProducts = ({ products }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">
          Top Selling Products
        </h2>
        <TrendingUp className="w-4 h-4 text-green-600" />
      </div>

      <div className="space-y-4">
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
              className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">
                  #{index + 1}
                </span>
              </div>
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-sm text-gray-600">
                  R{product.price?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{product.sold}</p>
                <p className="text-xs text-gray-500">sold</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopProducts;
