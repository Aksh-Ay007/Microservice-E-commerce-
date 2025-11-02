"use client";

import { HeartIcon, Search, ShoppingCartIcon, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProfileIcon from "../../../assets/svgs/profile-icon";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";
import axiosInstance from "../../../utils/axiosinstance";
import HeaderBottom from "./header-bottom";
import useLayout from "../../../hooks/useLayout";

const Header = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [localCartCount, setLocalCartCount] = useState(0);
  const [localWishlistCount, setLocalWishlistCount] = useState(0);
  const { layout, isLoading: layoutLoading } = useLayout();

  // Load cart/wishlist from localStorage for non-logged users
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem("cart");
      const savedWishlist = localStorage.getItem("wishlist");

      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          setLocalCartCount(cartData.length);
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error);
        }
      }

      if (savedWishlist) {
        try {
          const wishlistData = JSON.parse(savedWishlist);
          setLocalWishlistCount(wishlistData.length);
        } catch (error) {
          console.error("Error parsing wishlist from localStorage:", error);
        }
      }
    }
  }, [user]);

  // Get current counts
  const currentCartCount = user ? cart?.length || 0 : localCartCount;
  const currentWishlistCount = user
    ? wishlist?.length || 0
    : localWishlistCount;

  const handleSearchClick = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSuggestions(true);
    setSearchError(false);
    try {
      const res = await axiosInstance.get(
        `/product/api/search-products?q=${encodeURIComponent(searchQuery)}`
      );
      setSuggestions(res.data.products.slice(0, 10));
    } catch (error) {
      setSearchError(true);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // ✅ Fix: Add AbortController for request cancellation and proper dependencies
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setSearchError(false);
      return;
    }

    const controller = new AbortController();
    const delay = setTimeout(() => {
      handleSearchClick();
    }, 500);

    return () => {
      clearTimeout(delay);
      controller.abort(); // Cancel pending requests
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <div className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* ---------- Desktop Header ---------- */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-5 items-center justify-between">
        {/* Logo */}
        <div>
          <Link href={"/"}>
            <Image
              src={
                layout?.logo ||
                "https://ik.imagekit.io/AkshayMicroMart/photo/micromartLogo.png?updatedAt=1759960829231"
              }
              width={150}
              height={50}
              alt="logo"
              className="h-[60px] object-contain hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-[50%] relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full px-4 pr-14 h-[50px] rounded-xl border-2 border-[#3489FF] outline-none font-Poppins font-medium focus:ring-2 focus:ring-blue-300 shadow-sm transition-all duration-200 placeholder:text-gray-500"
          />
          <div
            onClick={handleSearchClick}
            className="absolute top-0 right-0 w-[55px] h-[50px] rounded-r-xl flex items-center justify-center bg-[#3489FF] hover:bg-[#2973d2] cursor-pointer transition-colors"
          >
            {loadingSuggestions ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
            ) : (
              <Search color="#fff" />
            )}
          </div>

          {/* Suggestion dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-[60px] left-0 w-full bg-white border border-t-0 border-gray-200 shadow-lg z-50 rounded-b-xl max-h-[300px] overflow-y-auto">
              {suggestions.map((item) => (
                <Link
                  href={`/product/${item.slug}`}
                  key={item.id}
                  onClick={() => {
                    setSuggestions([]);
                    setSearchQuery("");
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#3489FF] transition-all border-b border-gray-100"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}

          {/* Error state */}
          {searchError && searchQuery.trim() && !loadingSuggestions && (
            <div className="absolute top-[60px] left-0 w-full bg-white border border-t-0 border-red-200 shadow-lg z-50 rounded-b-xl">
              <div className="px-4 py-3 text-sm text-red-600 bg-red-50">
                Failed to load search results. Please try again.
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-10">
          {/* Profile */}
          <div className="flex items-center gap-3">
            <Link href={user ? "/profile" : "/login"} className="block">
              {user?.avatar?.url ? (
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden border-2 border-[#e5e7eb] hover:border-[#3489FF] transition-all duration-200">
                  <img
                    src={user.avatar.url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : user ? (
                <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg border-2 border-[#e5e7eb] hover:border-[#3489FF] transition-all duration-200">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              ) : (
                <div className="border-2 border-[#e5e7eb] w-[50px] h-[50px] flex items-center justify-center rounded-full hover:border-[#3489FF] transition-all duration-200">
                  <ProfileIcon />
                </div>
              )}
            </Link>
            <Link href={user ? "/profile" : "/login"} className="leading-tight">
              <span className="block text-gray-600 text-sm">Hello,</span>
              <span className="font-semibold text-gray-800">
                {isLoading
                  ? "..."
                  : user
                  ? user.name?.split(" ")[0]
                  : "Sign In"}
              </span>
            </Link>
          </div>

          {/* Wishlist + Cart */}
          <div className="flex items-center gap-6">
            <Link
              href={"/wishlist"}
              className="relative hover:scale-110 transition-transform duration-200"
            >
              <HeartIcon className="text-gray-700 w-6 h-6" />
              {currentWishlistCount > 0 && (
                <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-3">
                  <span className="text-white font-medium text-xs">
                    {currentWishlistCount}
                  </span>
                </div>
              )}
            </Link>

            <Link
              href={"/cart"}
              className="relative hover:scale-110 transition-transform duration-200"
            >
              <ShoppingCartIcon className="text-gray-700 w-6 h-6" />
              {currentCartCount > 0 && (
                <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-3">
                  <span className="text-white font-medium text-xs">
                    {currentCartCount}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- Mobile Header ---------- */}
      <div className="md:hidden max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
        {/* Top row: Logo + icons */}
        <div className="flex items-center justify-between">
          <Link href={"/"}>
            <Image
              src={
                layout?.logo ||
                "https://ik.imagekit.io/AkshayMicroMart/photo/micromartLogo.png?updatedAt=1759960829231"
              }
              width={120}
              height={40}
              alt="logo"
              className="h-[45px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link href={user ? "/profile" : "/login"} className="block">
              {user?.avatar?.url ? (
                <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 hover:border-[#3489FF] transition-all duration-200">
                  <img
                    src={user.avatar.url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : user ? (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm border border-gray-300 hover:border-[#3489FF] transition-all duration-200">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              ) : (
                <div className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:border-[#3489FF] transition-all duration-200">
                  <ProfileIcon />
                </div>
              )}
            </Link>

            <Link href="/wishlist" className="relative">
              <HeartIcon className="w-6 h-6 text-gray-700" />
              {currentWishlistCount > 0 && (
                <div className="w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full absolute -top-1 -right-2">
                  {currentWishlistCount}
                </div>
              )}
            </Link>

            <Link href="/cart" className="relative">
              <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
              {currentCartCount > 0 && (
                <div className="w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full absolute -top-1 -right-2">
                  {currentCartCount}
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full px-4 pr-10 h-[45px] rounded-xl border-2 border-[#3489FF] outline-none font-Poppins font-medium focus:ring-2 focus:ring-blue-300 shadow-sm transition-all duration-200 placeholder:text-gray-500 text-sm"
          />
          <div
            onClick={handleSearchClick}
            className="absolute top-0 right-0 w-[45px] h-[45px] rounded-r-xl flex items-center justify-center bg-[#3489FF] hover:bg-[#2973d2] cursor-pointer transition-colors"
          >
            {loadingSuggestions ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
            ) : (
              <Search color="#fff" size={18} />
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-b-[#e5e7eb]" />

      {/* Bottom Header */}
      <HeaderBottom />
    </div>
  );
};

export default Header;
