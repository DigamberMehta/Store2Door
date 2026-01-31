const CategoryFilterShimmer = () => {
  return (
    <div className="py-2 pb-3 overflow-x-auto scrollbar-none bg-black/20 backdrop-blur-sm border-b border-white/10 relative">
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

      <div className="flex gap-2 md:gap-3 px-3 md:px-4 min-w-min relative z-10">
        {/* Render 8 shimmer category items */}
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 md:px-3 md:py-2 min-w-[55px] md:min-w-[65px] flex-shrink-0"
          >
            {/* Icon shimmer */}
            <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-shimmer rounded-full"></div>

            {/* Text shimmer */}
            <div className="w-10 h-2.5 md:h-3 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-shimmer rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilterShimmer;
