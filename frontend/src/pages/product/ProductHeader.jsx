import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineSearch } from "react-icons/hi";
import { Share2, Heart } from "lucide-react";

const ProductHeader = () => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 px-3 py-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 active:bg-white/10 rounded-full transition-all"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>
          <button
            onClick={() => {}}
            className="p-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/search")}
            className="p-1.5 -mr-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <HiOutlineSearch className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
