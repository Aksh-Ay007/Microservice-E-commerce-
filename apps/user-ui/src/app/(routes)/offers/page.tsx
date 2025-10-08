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

export default function Page() {
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
    router.replace(`/offers?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredOffers = async () => {
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
        `product/api/get-filtered-offers?${query.toString()}`
      );

      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.log("failed to fetch products", error);
    } finally {
      setIsProductLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredOffers();
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

  const FiltersPanel = (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="text-lg font-medium border-b pb-1 mb-3">Price Range</h3>
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
                  style={{ left: `${left}%`, width: `${right - left}%` }}
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
        <div className="flex justify-between mt-2 items-center">
          <p className="text-sm text-gray-600">
            ${tempPriceRange[0]} - ${tempPriceRange[1]}
          </p>
          <button
            disabled={isApplyDisabled}
            onClick={() => {
              setPriceRange(tempPriceRange);
              setPage(1);
            }}
            className={`text-sm px-4 py-1 rounded ${
              isApplyDisabled
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-lg font-medium border-b pb-1 mb-3">Categories</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-2">
            {data?.categories?.map((category: any) => (
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
            ))}
          </ul>
        )}
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-lg font-medium border-b pb-1 mb-3">Colors</h3>
        <ul className="space-y-2">
          {colors.map((color) => (
            <li key={color.name}>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
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
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-medium border-b pb-1 mb-3">Sizes</h3>
        <ul className="space-y-2">
          {sizes.map((size) => (
            <li key={size}>
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="accent-blue-600"
                />
                {size}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={clearAllFilters}
        className="text-red-600 text-sm underline mt-2"
      >
        Clear All
      </button>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-10">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="pb-6 pt-6 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            All Offers
          </h1>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span>All Offers</span>
          </div>
        </div>

        {/* Mobile filter button */}
        <div className="lg:hidden flex justify-end mb-4">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm bg-white"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - visible on lg+ */}
          <aside className="hidden lg:block w-[270px] rounded bg-white p-4 shadow-md">
            {FiltersPanel}
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            {isProductLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[220px] bg-gray-200 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isEvent={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] bg-white rounded-xl shadow-sm">
                <p className="text-lg font-medium text-gray-600 mb-2">
                  No Offers Found
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 text-sm underline hover:text-blue-700"
                >
                  Clear filters and try again
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
                    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                      page === index + 1
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
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

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-[85%] max-w-[360px] bg-white h-full shadow-xl overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <X />
              </button>
            </div>
            {FiltersPanel}
          </div>
        </div>
      )}
    </div>
  );
}
