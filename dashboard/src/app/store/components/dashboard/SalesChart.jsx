import { TrendingUp } from "lucide-react";

const SalesChart = ({ data = [] }) => {
  console.log("[SalesChart] Received data:", data);

  // Check if we have any data at all
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Sales Overview</h2>
        </div>
        <div className="flex items-center justify-center h-40 mt-8">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value || 0));
  const hasData = maxValue > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">Sales Overview</h2>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-40 mt-8">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No sales data yet</p>
            <p className="text-xs text-gray-400">Sales will appear here</p>
          </div>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2 h-40 mt-8">
          {data.map((item, index) => {
            const height = ((item.value || 0) / maxValue) * 100;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex items-end justify-center h-40">
                  <div
                    className="w-full bg-linear-to-t from-green-600 to-emerald-500 rounded-t-lg relative group cursor-pointer transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      R{item.value.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SalesChart;
