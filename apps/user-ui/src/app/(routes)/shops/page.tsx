"use client";

import { ChevronRight, Filter, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { categories } from "../../../configs/categories/categories";
import { countries } from "../../../configs/countries/countries";
import ShopCard from "../../../shared/components/cards/shop.card";
import axiosInstance from "../../../utils/axiosinstance";

const Page = () => {
  const router = useRouter();
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreCountries, setShowMoreCountries] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const updateURL = () => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0)
      params.set("categories", selectedCategories.join(","));
    if (selectedCountries.length > 0)
      params.set("countries", selectedCountries.join(","));
    params.set("page", page.toString());
    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();

      if (selectedCategories.length > 0)
        query.set("categories", selectedCategories.join(","));
      if (selectedCountries.length > 0)
        query.set("countries", selectedCountries.join(","));

      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `product/api/get-filtered-shops?${query.toString()}`
      );

      setShops(res.data.shops);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.log("failed to fetch shops", error);
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedCountries, page]);

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleCountry = (label: string) => {
    setSelectedCountries((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setPage(1);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  /* --- reusable filter panel markup so we can render it in two places --- */
  const FiltersPanel = (
    <div className="w-full">
      {/* Categories */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold border-b pb-2 border-gray-200">
          Categories
        </h3>
        <ul className="space-y-2 mt-3">
          {(showMoreCategories ? categories : categories.slice(0, 5)).map(
            (category: any) => (
              <li key={category.label}>
                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.value)}
                    onChange={() => toggleCategory(category.value)}
                    className="accent-blue-600"
                  />
                  {category.value}
                </label>
              </li>
            )
          )}
        </ul>

        {categories.length > 5 && (
          <button
            onClick={() => setShowMoreCategories(!showMoreCategories)}
            className="text-blue-600 text-sm font-medium hover:underline mt-2"
          >
            {showMoreCategories ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Countries */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold border-b pb-2 border-gray-200">
          Countries
        </h3>
        <ul className="space-y-2 mt-3">
          {(showMoreCountries ? countries : countries.slice(0, 4)).map(
            (country: any) => (
              <li key={country.code}>
                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country.name)}
                    onChange={() => toggleCountry(country.name)}
                    className="accent-blue-600"
                  />
                  {country.name}
                </label>
              </li>
            )
          )}
        </ul>

        {countries.length > 4 && (
          <button
            onClick={() => setShowMoreCountries(!showMoreCountries)}
            className="text-blue-600 text-sm font-medium hover:underline mt-2"
          >
            {showMoreCountries ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={clearAllFilters}
          className="text-sm text-red-600 underline mt-2"
        >
          Clear All
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-12">
      <div className="w-[92%] lg:w-[80%] mx-auto">
        {/* Header */}
        <div className="pb-6 pt-6 text-center">
          <h1 className="font-semibold text-[28px] md:text-[40px] mb-2 font-jost text-gray-800">
            All Shops
          </h1>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span>All Shops</span>
          </div>
        </div>

        {/* mobile filter button */}
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
          {/* Sidebar for large screens (always visible on lg+) */}
          <aside className="hidden lg:block w-[270px] rounded bg-white p-4 space-y-6 shadow-md border border-gray-100">
            {FiltersPanel}
          </aside>

          {/* MAIN GRID */}
          <div className="flex-1">
            {isShopLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[220px] bg-gray-200 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-lg font-medium text-gray-600 mb-2">
                  No Shops Found
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 text-sm underline hover:text-blue-700 transition"
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

      {/* Mobile filter drawer (slide-over) */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          aria-modal="true"
          role="dialog"
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* panel */}
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
};

export default Page;
