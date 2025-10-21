"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Filter, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Range } from "react-range";
import ProductCard from "../../../shared/components/cards/product-card";
import axiosInstance from "../../../utils/axiosinstance";

const MIN = 0;
const MAX = 1199;

const Page = () => {
  const router = useRouter();
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // mobile filter drawer

  const colors = [
    { name: "Red", code: "#FF0000" },
    { name: "Blue", code: "#0000FF" },
    { name: "Green", code: "#008000" },
    { name: "Black", code: "#000000" },
    { name: "White", code: "#FFFFFF" },
    { name: "Yellow", code: "#FFFF00" },
    { name: "Purple", code: "#800080" },
    { name: "Orange", code: "#FFA500" },
    { name: "Pink", code: "#FFC0CB" },
    { name: "Gray", code: "#808080" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const updateURL = () => {
    const params = new URLSearchParams();
    params.set("priceRange", priceRange.join(","));
    if (selectedCategories.length > 0)
      params.set("categories", selectedCategories.join(","));
    if (selectedColors.length > 0)
      params.set("colors", selectedColors.join(","));
    if (selectedSizes.length > 0) params.set("sizes", selectedSizes.join(","));
    params.set("page", page.toString());
    router.replace(`/products?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("priceRange", priceRange.join(","));
      if (selectedCategories.length > 0)
        query.set("categories", selectedCategories.join(","));
      if (selectedColors.length > 0)
        query.set("colors", selectedColors.join(","));
      if (selectedSizes.length > 0) query.set("sizes", selectedSizes.join(","));
      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `product/api/get-filtered-products?${query.toString()}`
      );
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error(error, "failed to fetch products");
    } finally {
      setIsProductLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedColors, selectedSizes, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("product/api/get-categories");
      return res.data;
    },
    staleTime: 30 * 60 * 1000,
  });

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 1199]);
    setTempPriceRange([0, 1199]);
    setPage(1);
  };

  const isApplyDisabled =
    tempPriceRange[0] === priceRange[0] && tempPriceRange[1] === priceRange[1];

  return (
    <div className="w-full bg-[#f9fafb] pb-10">
      {/* Mobile Floating Filter Button */}
      <button
        onClick={() => setIsFilterOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
      >
        <Filter size={20} />
        <span className="font-medium">Filters</span>
      </button>

      <div className="w-[90%] lg:w-[80%] m-auto">
        <div className="pb-[30px]">
          <div className="flex items-center justify-between">
            <h1 className="md:pt-[30px] font-semibold text-[28px] md:text-[44px] mb-[10px] font-jost">
              All Products
            </h1>
          </div>

          <div className="flex items-center text-sm">
            <Link href="/" className="text-[#55585b] hover:underline">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2 text-[#a8acb0]" />
            <span className="text-[#55585b]">All Products</span>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategories.length > 0 ||
          selectedColors.length > 0 ||
          selectedSizes.length > 0 ||
          priceRange[0] !== 0 ||
          priceRange[1] !== 1199) && (
          <div className="flex flex-wrap gap-2 items-center mb-6">
            {[...selectedCategories, ...selectedColors, ...selectedSizes].map(
              (filter) => (
                <span
                  key={filter}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                >
                  {filter}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => {
                      toggleCategory(filter);
                      toggleColor(filter);
                      toggleSize(filter);
                    }}
                  />
                </span>
              )
            )}
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (hidden on mobile) */}
          <aside className="hidden lg:block w-[270px] rounded bg-white p-4 space-y-6 shadow-md">
            <FilterSection
              {...{
                MIN,
                MAX,
                tempPriceRange,
                setTempPriceRange,
                priceRange,
                setPriceRange,
                isApplyDisabled,
                isLoading,
                data,
                toggleCategory,
                selectedCategories,
                colors,
                toggleColor,
                selectedColors,
                sizes,
                toggleSize,
                selectedSizes,
                clearAllFilters,
              }}
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isProductLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[220px] bg-gray-200 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 rounded-lg shadow-inner">
                <img
                  src="/no-results.svg"
                  alt="No Results"
                  className="w-28 h-28 mb-3 opacity-80"
                />
                <p className="text-base md:text-lg font-semibold text-gray-600 mb-1">
                  No Products Found
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Try adjusting your filters
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 text-sm underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setPage(index + 1)}
                    className={`px-3 py-1 rounded border text-sm ${
                      page === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white text-black border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end"
          onClick={() => setIsFilterOpen(false)}
        >
          <div 
            className="w-[85%] max-w-[320px] bg-white h-full shadow-lg p-4 overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-600 hover:text-black p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <FilterSection
              {...{
                MIN,
                MAX,
                tempPriceRange,
                setTempPriceRange,
                priceRange,
                setPriceRange,
                isApplyDisabled,
                isLoading,
                data,
                toggleCategory,
                selectedCategories,
                colors,
                toggleColor,
                selectedColors,
                sizes,
                toggleSize,
                selectedSizes,
                clearAllFilters,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;

/* ------------------------------ Reusable Filter Section ------------------------------ */
const FilterSection = ({
  MIN,
  MAX,
  tempPriceRange,
  setTempPriceRange,
  priceRange,
  setPriceRange,
  isApplyDisabled,
  isLoading,
  data,
  toggleCategory,
  selectedCategories,
  colors,
  toggleColor,
  selectedColors,
  sizes,
  toggleSize,
  selectedSizes,
  clearAllFilters,
}: any) => (
  <>
    {/* Price Filter */}
    <h3 className="text-xl font-medium font-Poppins">Price Range</h3>
    <div className="ml-2">
      <Range
        step={1}
        min={MIN}
        max={MAX}
        values={tempPriceRange}
        onChange={(values) => setTempPriceRange(values)}
        renderTrack={({ props, children }) => {
          const [min, max] = tempPriceRange;
          const left = ((min - MIN) / (MAX - MIN)) * 100;
          const right = ((max - MIN) / (MAX - MIN)) * 100;
          return (
            <div
              {...props}
              className="h-[6px] bg-blue-200 rounded relative"
              style={{ ...props.style }}
            >
              <div
                className="absolute h-full bg-blue-600 rounded"
                style={{
                  left: `${left}%`,
                  width: `${right - left}%`,
                }}
              />
              {children}
            </div>
          );
        }}
        renderThumb={({ props }) => (
          <div
            {...props}
            className="w-[16px] h-[16px] bg-blue-600 rounded-full shadow-md"
          />
        )}
      />
    </div>
    <div className="flex justify-between items-center mt-2">
      <div className="text-sm text-gray-600">
        ${tempPriceRange[0]} - ${tempPriceRange[1]}
      </div>
      <button
        disabled={isApplyDisabled}
        onClick={() => setPriceRange(tempPriceRange)}
        className={`text-sm px-4 py-1 rounded transition ${
          isApplyDisabled
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Apply
      </button>
    </div>

    {/* Categories */}
    <h3 className="text-lg font-medium border-b border-slate-300 pb-1 mt-5">
      Categories
    </h3>
    <ul className="space-y-2 mt-3">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        data?.categories?.map((category: any) => (
          <li key={category}>
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="accent-blue-600"
              />
              {category}
            </label>
          </li>
        ))
      )}
    </ul>

    {/* Colors */}
    <h3 className="text-lg font-medium border-b border-slate-300 pb-1 mt-5">
      Colors
    </h3>
    <ul className="space-y-2 mt-3">
      {colors.map((color) => (
        <li key={color.name}>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selectedColors.includes(color.name)}
              onChange={() => toggleColor(color.name)}
              className="accent-blue-600"
            />
            <span
              className={`w-[18px] h-[18px] rounded-full border-2 ${
                selectedColors.includes(color.name)
                  ? "border-blue-600"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: color.code }}
            ></span>
            {color.name}
          </label>
        </li>
      ))}
    </ul>

    {/* Sizes */}
    <h3 className="text-lg font-medium border-b border-slate-300 pb-1 mt-5">
      Sizes
    </h3>
    <ul className="space-y-2 mt-3">
      {sizes.map((size) => (
        <li key={size}>
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selectedSizes.includes(size)}
              onChange={() => toggleSize(size)}
              className="accent-blue-600"
            />
            <span className="font-medium">{size}</span>
          </label>
        </li>
      ))}
    </ul>

    <button
      onClick={clearAllFilters}
      className="text-red-600 underline text-sm mt-4"
    >
      Clear All
    </button>
  </>
);
