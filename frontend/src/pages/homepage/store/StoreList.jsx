import { HiOutlineSearch } from "react-icons/hi";
import StoreCard from "./StoreCard";

const StoreList = ({ stores, onStoreClick, onCategoryClick }) => {
  return (
    <main className="bg-black w-full">
      <div className="grid grid-cols-1 gap-1.5 mb-20 md:grid-cols-2 px-0">
        {stores.map((store) => (
          <StoreCard
            key={store._id || store.id}
            store={store}
            onStoreClick={onStoreClick}
          />
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-15 px-5">
          <HiOutlineSearch className="text-6xl text-slate-300 block mx-auto mb-4" />
          <p className="text-lg font-semibold text-white my-2">
            No stores found
          </p>
          <p className="text-sm text-zinc-500 font-normal">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </main>
  );
};

export default StoreList;
