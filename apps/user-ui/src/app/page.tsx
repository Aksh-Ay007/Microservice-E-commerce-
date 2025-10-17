"use client";

import { useQuery } from "@tanstack/react-query";
import ProductCard from "../shared/components/cards/product-card";
import ShopCard from "../shared/components/cards/shop.card";
import SectionTitle from "../shared/components/section/section-title";
import Hero from "../shared/modules/hero";
import axiosInstance from "../utils/axiosinstance";

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Page = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", "page=1", "limit=10"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });

  const { data: latestProducts, isLoading: LatestProductsLoading, isError: latestProductsError } = useQuery({
    queryKey: ["products", "latest", "page=1", "limit=10"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10&type=latest"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 2,
  });

  const { data: shops, isLoading: shopLoading, isError: shopsError } = useQuery({
    queryKey: ["shops", "top"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes for shops
    cacheTime: 1000 * 60 * 15,
    retry: 2,
  });

  const { data: offers, isLoading: offersLoading, isError: offersError } = useQuery({
    queryKey: ["events", "offers", "page=1", "limit=10"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-events?page=1&limit=10"
      );
      return res.data.events;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes for offers
    cacheTime: 1000 * 60 * 8,
    retry: 2,
  });

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />

      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        <ErrorBoundary>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load products. Please try again later.</p>
            </div>
          ) : (
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </ErrorBoundary>

        {!isLoading && !isError && products?.length === 0 && (
          <p className="text-center">No products available yet!</p>
        )}

        <div className="my-8 block">
          <SectionTitle title="Latest Products" />
        </div>

        <ErrorBoundary>
          {LatestProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : latestProductsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load latest products. Please try again later.</p>
            </div>
          ) : (
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {latestProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </ErrorBoundary>

        {latestProducts?.length === 0 && (
          <p className="text-center">No products available yet!</p>
        )}

        <div className="mt-8 block">
          <SectionTitle title="Top Shops" />
        </div>

        <ErrorBoundary>
          {shopLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : shopsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load shops. Please try again later.</p>
            </div>
          ) : (
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {shops?.map((shop: any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </ErrorBoundary>
        {!shopLoading && shops?.length === 0 && (
          <p className="text-center">No Shops available yet!</p>
        )}

        <div className="mt-8 block">
          <SectionTitle title="Top Offers" />
        </div>

        <ErrorBoundary>
          {offersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : offersError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load offers. Please try again later.</p>
            </div>
          ) : (
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {offers?.map((product: any) => (
                <ProductCard key={product.id} product={product} isEvent={true} />
              ))}
            </div>
          )}
        </ErrorBoundary>
        {!offersLoading && offers?.length === 0 && (
          <p className="text-center">No offers available yet!</p>
        )}
      </div>
    </div>
  );
};

export default Page;
