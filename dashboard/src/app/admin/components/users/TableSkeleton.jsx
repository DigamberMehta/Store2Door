const TableSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 px-6 py-4">
          <div className="col-span-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="col-span-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="col-span-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="col-span-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="col-span-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="col-span-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Table Rows Skeleton */}
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
        >
          <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
            {/* Checkbox */}
            <div className="col-span-1">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* User Info */}
            <div className="col-span-3 flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>

            {/* Contact */}
            <div className="col-span-2 space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>

            {/* Role */}
            <div className="col-span-2">
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
