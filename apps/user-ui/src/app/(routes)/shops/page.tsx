"use client";

import { ChevronRight } from "lucide-react";
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

      console.log(res.data, "filtered shops");
      setShops(res.data.shops);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.log(error, "failed to fetch shops");
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
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
      prev.includes(label)
        ? prev.filter((cou) => cou !== label)
        : [...prev, label]
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

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-12">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        {/* Header Section */}
        <div className="pb-[40px] pt-[30px] text-center">
          <h1 className="font-semibold text-[36px] md:text-[44px] mb-[10px] font-jost text-gray-800">
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          {/* Sidebar */}
          <aside className="w-full lg:w-[270px] rounded bg-white p-4 space-y-6 shadow-md">
            {/* Categories */}
            <h3 className="text-xl font-Poppins font-medium border-b border-slate-300 pb-1">
              Categories
            </h3>

            {/* Show limited categories */}
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

            {/* Show More / Show Less toggle */}
            {categories.length > 5 && (
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className="text-blue-600 text-sm font-medium hover:underline mt-1"
              >
                {showMoreCategories ? "Show less" : "Show more"}
              </button>
            )}

            {/* Countries */}
            <h3 className="text-xl font-Poppins font-medium border-b border-slate-300 pb-1 mt-6">
              Countries
            </h3>

            <ul className="space-y-2 mt-3">
              {(showMoreCountries ? countries : countries.slice(0, 4)).map(
                (country: any) => (
                  <li
                    key={country.code}
                    className="flex items-center justify-between"
                  >
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

            {/* Show More / Show Less toggle for countries */}
            {countries.length > 4 && (
              <button
                onClick={() => setShowMoreCountries(!showMoreCountries)}
                className="text-blue-600 text-sm font-medium hover:underline mt-1"
              >
                {showMoreCountries ? "Show less" : "Show more"}
              </button>
            )}
          </aside>

          {/* Shop Grid */}
          <div className="flex-1">
            {isShopLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[250px] bg-gray-200 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] bg-white rounded-xl shadow-sm border border-gray-100">
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
              <div className="flex justify-center mt-10 gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setPage(index + 1)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
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
    </div>
  );
};

export default Page;
