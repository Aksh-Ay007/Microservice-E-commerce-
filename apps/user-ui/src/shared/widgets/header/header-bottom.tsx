"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlignLeft,
  ChevronDown,
  HeartIcon,
  ShoppingCartIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProfileIcon from "../../../assets/svgs/profile-icon";
import { navItems } from "../../../configs/constants";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";
import axiosInstance from "../../../utils/axiosinstance";

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [expandingCategory, setExpandingCategory] = useState<string | null>(
    null
  );

  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const { user, isLoading } = useUser();

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      console.log(res,'categories');

      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky
          ? "fixed top-0 left-0 z-[100] bg-white shadow-lg"
          : "shadow-sm relative"
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        {/* All Departments Dropdown Trigger */}
        <div
          className={`w-[260px] ${
            isSticky && "-mb-2"
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          <ChevronDown color="white" />
        </div>

        {/* Dropdown menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? "top-[70px]" : "top-[50px]"
            } w-[260px] max-h-[400px] overflow-y-auto bg-white border border-gray-300 shadow-lg z-50`}
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
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                    >
                      <span>{cat}</span>
                      {hasSub &&
                        (isExpanded ? (
                          <ChevronDown className="w-4 h-4 rotate-180 transition-transform" />
                        ) : (
                          <ChevronDown className="w-4 h-4 -rotate-90 transition-transform" />
                        ))}
                    </button>

                    {isExpanded && hasSub && (
                      <div className="pl-4 bg-gray-50 border-t border-white">
                        {data.subCategories?.[cat]?.map(
                          (sub: string, j: number) => (
                            <Link
                              key={j}
                              href={`/products?category=${encodeURIComponent(
                                cat
                              )}`}
                              className="block px-4 text-sm text-gray-900 py-2 border-b border-white last:border-0"
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
        )}

        {/* Navigation Links */}
        <div className="flex items-center">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className="px-5 font-medium text-lg"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>

        {/* Right Section: Profile + Wishlist + Cart */}
        <div>
          {isSticky && (
            <div className="flex items-center gap-8 pb-2">
              <div className="flex items-center gap-8">
                {/* Profile */}
                <div className="flex items-center gap-2">
                  {!isLoading && user ? (
                    <>
                      <Link
                        href={"/profile"}
                        className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                      >
                        <ProfileIcon />
                      </Link>
                      <Link href={"/profile"}>
                        <span className="block font-medium">Hello,</span>
                        <span className="font-semibold">
                          {user?.name?.split(" ")[0]}
                        </span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={"/login"}
                        className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                      >
                        <ProfileIcon />
                      </Link>
                      <Link href={"/login"}>
                        <span className="block font-medium">Hello,</span>
                        <span className="font-semibold">
                          {isLoading ? "..." : "Sign In"}
                        </span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Wishlist + Cart */}
                <div className="flex items-center gap-5">
                  <Link href={"/wishlist"} className="relative">
                    <HeartIcon />
                    {wishlist.length > 0 && (
                      <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2">
                        <span className="text-white font-medium text-sm">
                          {wishlist.length}
                        </span>
                      </div>
                    )}
                  </Link>

                  <Link href={"/cart"} className="relative">
                    <ShoppingCartIcon />
                    {cart.length > 0 && (
                      <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2">
                        <span className="text-white font-medium text-sm">
                          {cart.length}
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
