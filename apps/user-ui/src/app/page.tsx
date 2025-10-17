"use client";

import { useQuery } from "@tanstack/react-query";
import ProductCard from "../shared/components/cards/product-card";
import ShopCard from "../shared/components/cards/shop.card";
import SectionTitle from "../shared/components/section/section-title";
import Hero from "../shared/modules/hero";
import ErrorBoundary from "../shared/components/error-boundary";
import axiosInstance from "../utils/axiosinstance";

// Shared query configuration for consistent caching
const QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 minutes - consistent across all queries
  cacheTime: 1000 * 60 * 10, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 2,
};

const Page = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", "suggested", { page: 1, limit: 10 }],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10"
      );
      return res.data.products;
    },
    ...QUERY_CONFIG,
  });

  const { data: latestProducts, isLoading: LatestProductsLoading } = useQuery({
    queryKey: ["products", "latest", { page: 1, limit: 10 }],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10&type=latest"
      );
      return res.data.products;
    },
    ...QUERY_CONFIG,
  });

  const { data: shops, isLoading: shopLoading } = useQuery({
    queryKey: ["shops", "top"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    ...QUERY_CONFIG,
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["events", "offers", { page: 1, limit: 10 }],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-events?page=1&limit=10"
      );
      return res.data.events;
    },
    ...QUERY_CONFIG,
  });

  return (
    <div className="bg-[#f5f5f5]">
      <ErrorBoundary>
        <Hero />
      </ErrorBoundary>

      <div className="max-w-7xl w-full px-4 my-10 mx-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
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
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products?.length === 0 && (
          <p className="text-center">No products available yet!</p>
        )}


        <div className="my-8 block">
          <SectionTitle title="Latest Products" />
        </div>

        {LatestProductsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}
        {!LatestProductsLoading && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {latestProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {latestProducts?.length === 0 && (
          <p className="text-center">No products available yet!</p>
        )}

        <div className="mt-8 block">
          <SectionTitle title="Top Shops" />
        </div>

        {shopLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}
        {!shopLoading && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {shops?.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
        {shops?.length === 0 && (
          <p className="text-center">No Shops available yet!</p>
        )}

        <div className="mt-8 block">
          <SectionTitle title="Top Offers" />
        </div>

        {offersLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}
        {!offersLoading && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {offers?.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent={true} />
            ))}
          </div>
        )}
        {offers?.length === 0 && (
          <p className="text-center">No offers available yet!</p>
        )}
      </div>
    </div>
  );
};

export default Page;
