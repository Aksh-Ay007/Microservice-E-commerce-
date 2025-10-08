"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlignLeft,
  ChevronDown,
  Menu,
  X,
  HeartIcon,
  ShoppingCartIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navItems } from "../../../configs/constants";
import axiosInstance from "../../../utils/axiosinstance";
import { useStore } from "../../../store";

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [expandingCategory, setExpandingCategory] = useState<string | null>(
    null
  );
  const [mobileMenu, setMobileMenu] = useState(false);

  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky
          ? "fixed top-0 left-0 z-[100] bg-white shadow-md"
          : "relative shadow-sm"
      }`}
    >
      <div
        className={`w-[90%] md:w-[80%] m-auto flex items-center justify-between transition-all duration-300 ${
          isSticky ? "py-3" : "py-0"
        }`}
      >
        {/* All Departments Button */}
        <div
          className="w-[240px] cursor-pointer flex items-center justify-between px-5 h-[50px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md rounded-t-md"
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          <ChevronDown color="white" />
        </div>

        {/* Category Dropdown */}
        <div
          className={`absolute left-0 ${
            isSticky ? "top-[70px]" : "top-[50px]"
          } w-[240px] max-h-[400px] overflow-y-auto bg-white border border-gray-300 shadow-lg z-50 transition-all duration-300 ease-in-out ${
            show
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
        >
          {data?.categories?.length > 0 ? (
            data.categories.map((cat: string, i: number) => {
              const hasSub = data.subCategories?.[cat]?.length > 0;
              const isExpanded = expandingCategory === cat;

              return (
                <div key={i} className="relative">
                  <button
                    onClick={() => {
                      if (hasSub) {
                        setExpandingCategory((prev) =>
                          prev === cat ? null : cat
                        );
                      } else {
                        setShow(false);
                        window.location.href = `/products?category=${cat}`;
                      }
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <span>{cat}</span>
                    {hasSub && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? "rotate-180" : "-rotate-90"
                        }`}
                      />
                    )}
                  </button>

                  {isExpanded && hasSub && (
                    <div className="pl-6 border-l-2 border-blue-100 bg-gray-50">
                      {data.subCategories?.[cat]?.map(
                        (sub: string, j: number) => (
                          <Link
                            key={j}
                            href={`/products?category=${encodeURIComponent(
                              cat
                            )}`}
                            className="block px-4 text-sm text-gray-900 py-2 border-b border-white last:border-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => setShow(false)}
                          >
                            {sub}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="px-5 py-4 text-sm text-gray-500">
              No categories available
            </p>
          )}
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className="px-5 font-medium text-lg text-gray-800 hover:text-blue-600 relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:left-0 after:bottom-0 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>

        {/* Sticky Wishlist + Cart (only visible when sticky) */}
        {isSticky && (
          <div className="flex items-center gap-5">
            {/* Wishlist */}
            <Link
              href={"/wishlist"}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
            >
              <HeartIcon className="text-gray-700 w-6 h-6" />
              {wishlist?.length > 0 && (
                <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-1 -right-1">
                  <span className="text-white font-medium text-xs">
                    {wishlist.length}
                  </span>
                </div>
              )}
            </Link>

            {/* Cart */}
            <Link
              href={"/cart"}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
            >
              <ShoppingCartIcon className="text-gray-700 w-6 h-6" />
              {cart?.length > 0 && (
                <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-1 -right-1">
                  <span className="text-white font-medium text-xs">
                    {cart.length}
                  </span>
                </div>
              )}
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenu && (
        <div className="md:hidden w-full bg-white shadow-lg flex flex-col items-start px-6 py-4 space-y-3 border-t border-gray-100">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              key={index}
              href={i.href}
              onClick={() => setMobileMenu(false)}
              className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
            >
              {i.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderBottom;
