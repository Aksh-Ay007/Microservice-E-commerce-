"use client";

import { useQuery } from "@tanstack/react-query";
import ProductCard from "../shared/components/cards/product-card";
import ShopCard from "../shared/components/cards/shop.card";
import SectionTitle from "../shared/components/section/section-title";
import Hero from "../shared/modules/hero";
import ErrorBoundary from "../shared/components/error-boundary";
import axiosInstance from "../utils/axiosinstance";

const Page = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10"
      );

      return res.data.products;
    },
    staleTime: 1000 * 60 * 5, // Increased stale time for better caching
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes (replaced cacheTime)
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  const { data: latestProducts, isLoading: LatestProductsLoading, isError: latestProductsError } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10&type=latest"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { data: shops, isLoading: shopLoading, isError: shopsError } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 10, // Shops change less frequently
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });

  const { data: offers, isLoading: offersLoading, isError: offersError } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-events?page=1&limit=10"
      );
      return res.data.events;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />

      <div className="max-w-7xl mx-auto px-4 my-10">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        <ErrorBoundary>
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse "
                />
              ))}
            </div>
          )}
          {!isLoading && !isError && (
            <div className=" m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.isArray(products) && products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {Array.isArray(products) && products.length === 0 && (
            <p className="text-center">No products available yet!</p>
          )}
        </ErrorBoundary>


        <div className="my-8 block">
          <SectionTitle title="Latest Products" />
        </div>

        <ErrorBoundary>
          {!LatestProductsLoading && !latestProductsError && (
            <div className=" m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.isArray(latestProducts) && latestProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {Array.isArray(latestProducts) && latestProducts.length === 0 && (
            <p className="text-center">No products available yet!</p>
          )}
        </ErrorBoundary>

        <div className="mt-8 block">
          <SectionTitle title="Top Shops" />
        </div>

        <ErrorBoundary>
          {!shopLoading && !shopsError && (
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.isArray(shops) && shops.map((shop: any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
          {Array.isArray(shops) && shops.length === 0 && (
            <p className="text-center">No Shops available yet!</p>
          )}
        </ErrorBoundary>

        <div className="mt-8 block">
          <SectionTitle title="Top Offers" />
        </div>

        <ErrorBoundary>
          {!offersLoading && !offersError && (
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.isArray(offers) && offers.map((product: any) => (
                <ProductCard key={product.id} product={product} isEvent={true} />
              ))}
            </div>
          )}
          {Array.isArray(offers) && offers.length === 0 && (
            <p className="text-center">No offers available yet!</p>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Page;
