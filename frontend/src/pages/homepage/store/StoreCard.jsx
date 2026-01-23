import { MdStar } from "react-icons/md";
import { Heart } from "lucide-react";

const StoreCard = ({ store, onStoreClick }) => {
  console.log('StoreCard - Store:', store.name, 'Distance:', store.distance, 'Full store:', store);
  
  return (
    <div
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-2.5 flex gap-3.5 cursor-pointer transition-all duration-300 hover:bg-white/10 active:scale-[0.98] border border-white/5"
      onClick={() => onStoreClick(store)}
    >
      {/* Left Image Section */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <img
          src={
            store.logo ||
            store.image ||
            "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80"
          }
          alt={store.name}
          className="w-full h-full object-cover rounded-xl shadow-sm"
        />
      </div>

      {/* Right Details Section */}
      <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
        <h3 className="text-[15px] font-bold text-white truncate mb-0.5 tracking-tight font-sans">
          {store.name}
        </h3>

        <div className="flex items-center gap-1.5 text-[11px] mb-1">
          <div className="flex items-center gap-0.5 bg-[rgb(49,134,22)] px-1 py-0.5 rounded text-white text-[10px] font-bold">
            <MdStar className="text-[10px]" />
            <span>{store.stats?.averageRating || store.rating || "4.0"}</span>
          </div>
          <span className="text-zinc-500 font-normal">
            ({store.stats?.totalReviews || store.reviewCount || "1K+"})
          </span>
        </div>

        <p className="text-zinc-400 text-[11px] truncate mb-0.5 font-medium">
          {store.categories?.slice(0, 3).join(", ") ||
            store.tags?.join(", ") ||
            "Store"}
        </p>

        <p className="text-zinc-500 text-[11px] truncate font-medium">
          {store.address?.city || store.location || "Near Market"} •{" "}
          {store.distance ? `${store.distance} km` : "2.5 km"}
        </p>
      </div>
    </div>
  );
};

export default StoreCard;
