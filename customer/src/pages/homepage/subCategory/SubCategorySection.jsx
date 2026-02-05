const SubCategorySection = ({ title, items, onCategoryClick, route }) => {
  // Don't show section if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="px-2 py-4 bg-black max-w-xl mx-auto md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
      <h2 className="text-lg font-bold text-white mb-3 tracking-wide">
        {title}
      </h2>
      <div className="grid grid-cols-4 gap-2.5 max-w-full md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 sm:gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="text-center flex flex-col items-center justify-start gap-1 cursor-pointer transition-opacity duration-200 hover:opacity-80 active:scale-95"
            onClick={() =>
              onCategoryClick({
                category: item.name,
                slug: item.slug,
                parentCategory: title,
                route: `/category/${item.slug}`,
              })
            }
          >
            <div className="h-auto w-full aspect-square rounded-xl flex items-center justify-center mb-0 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 className="text-[11px] font-semibold text-gray-300 m-0 leading-snug tracking-wide pt-1">
              {item.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SubCategorySection;
