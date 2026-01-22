import { Star } from "lucide-react";

const StoreBanner = ({ store }) => {
  return (
    <div className="px-2 pt-2">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Store Image */}
        <div className="w-full h-44 relative">
          <img
            src={
              store.coverImage ||
              store.image ||
              "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80"
            }
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Store Info */}
        <div className="p-4 relative">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-2">
              <h1 className="text-xl font-black text-white leading-tight mb-1">
                {store.name}
              </h1>
              <div className="flex items-center gap-1.5 text-zinc-400 text-[12px] font-medium">
                <span>{store.deliveryTime || "25-30 mins"}</span>
                <span className="opacity-30">|</span>
                <span className="truncate">
                  {store.location || "Local Area"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-0.5 bg-[rgb(49,134,22)] px-2 py-0.5 rounded-lg text-white text-[11px] font-bold shadow-lg">
                <span>
                  {store.stats?.averageRating || store.rating || "4.5"}
                </span>
                <Star className="w-3 h-3 fill-blue-950" />
              </div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                {store.stats?.totalReviews || store.reviewCount || "1K+"}{" "}
                ratings
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreBanner;
