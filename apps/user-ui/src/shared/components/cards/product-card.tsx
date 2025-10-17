import { Eye, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useDeviceTracking from "../../../hooks/useDeviceTracking";
import useLocationTracking from "../../../hooks/useLocationTracking";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";
import Ratings from "../ratings";
import ProductDetailsCard from "./product-details.card";
import ErrorBoundary from "../error-boundary";

interface ProductCardProps {
  product: any;
  isEvent?: boolean;
}

const ProductCard = ({ product, isEvent }: ProductCardProps) => {
  const imageUrl =
    product?.images?.[0]?.url ||
    "https://www.freemockupworld.com/wp-content/uploads/2022/11/Free-Packaging-Product-Box-Mockup-01.jpg";

  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const addToWishList = useStore((state: any) => state.addToWishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist?.some((item: any) => item.id === product.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart?.some((item: any) => item.id === product.id);

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      // Calculate initial time immediately
      const calculateTimeLeft = () => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Event ended");
          return false; // Event ended, stop interval
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this offer`);
        return true; // Continue interval
      };

      // Calculate initial time
      if (!calculateTimeLeft()) return;

      // Use Intersection Observer to only run timer when component is visible
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            const interval = setInterval(() => {
              if (!calculateTimeLeft()) {
                clearInterval(interval);
              }
            }, 60000);
            
            // Store interval reference for cleanup
            return () => clearInterval(interval);
          }
        },
        { threshold: 0.1 }
      );

      // Find the component's DOM element and observe it
      const element = document.querySelector(`[data-product-id="${product.id}"]`);
      if (element) {
        observer.observe(element);
      }

      return () => {
        observer.disconnect();
      };
    }
    return;
  }, [isEvent, product?.ending_date, product?.id]);

  return (
    <div 
      className="w-full bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group border border-gray-100 relative"
      data-product-id={product?.id}
    >
      {/* Image Container */}
      <Link href={`/product/${product?.slug}`} className="block relative">
        <div className="relative w-full h-[200px] bg-gray-100">
          {/* Badges */}
          {isEvent && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-md shadow-lg z-10">
              OFFER
            </div>
          )}

          {product?.stock <= 5 && product?.stock > 0 && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-slate-800 text-xs font-semibold px-3 py-1 rounded-md shadow-lg z-10">
              ONLY {product?.stock} LEFT
            </div>
          )}

          {/* Action Buttons - Heart and Eye */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            {/* Heart Icon */}
            <button
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                isWishlisted
                  ? removeFromWishList(product.id, user, location, deviceInfo)
                  : addToWishList(
                      { ...product, quantity: 1 },
                      user,
                      location,
                      deviceInfo
                    );
              }}
              aria-label={isWishlisted ? `Remove ${product?.title} from wishlist` : `Add ${product?.title} to wishlist`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className="hover:scale-110 transition-transform"
                size={20}
                fill={isWishlisted ? "red" : "transparent"}
                stroke={isWishlisted ? "red" : "#4B5563"}
                strokeWidth={2}
              />
            </button>

            {/* Eye Icon */}
            <button
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(!open);
              }}
              aria-label={`Quick view ${product?.title}`}
              title="Quick view"
            >
              <Eye
                className="hover:scale-110 transition-transform"
                size={20}
                stroke="#6B7280"
                strokeWidth={2}
              />
            </button>

            {/* Cart Icon */}
            <button
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                !isInCart &&
                  addToCart(
                    { ...product, quantity: 1 },
                    user,
                    location,
                    deviceInfo
                  );
              }}
              disabled={isInCart}
              aria-label={isInCart ? `${product?.title} is already in cart` : `Add ${product?.title} to cart`}
              title={isInCart ? "Already in cart" : "Add to cart"}
            >
              <ShoppingBag
                className="hover:scale-110 transition-transform"
                size={22}
                stroke="#6B7280"
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Product Image */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
              <div className="w-12 h-12 mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📷</span>
              </div>
              <span className="text-xs text-center px-2">Image not available</span>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={product?.title || "Product image"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        {/* Shop Name */}
        {product?.Shop?.name && (
          <Link
              href={`/shop/${product?.Shop?.id}`}

            className="inline-block text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
          >
            {product.Shop.name}
          </Link>
        )}

        {/* Product Title */}
        <Link href={`/product/${product?.slug}`} className="block">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors min-h-[40px]">
            {product?.title}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="mt-2">
          <Ratings rating={product?.ratings || 0} />
        </div>

        {/* Price Section */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product?.sale_price}
            </span>
            <span className="text-sm line-through text-gray-400">
              ${product?.regular_price}
            </span>
          </div>
          <span className="text-green-500 text-sm font-medium">
            {product.totalSales} sold
          </span>
        </div>

        {/* Timer for events */}
        {isEvent && timeLeft && (
          <div className="mt-2">
            <span className="inline-block text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              {timeLeft}
            </span>
          </div>
        )}

        {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
      </div>
    </div>
  );
};

// Wrap with error boundary for graceful error handling
const ProductCardWithErrorBoundary = (props: ProductCardProps) => (
  <ErrorBoundary
    fallback={
      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4 border border-gray-200">
        <div className="text-4xl mb-2">📦</div>
        <p className="text-gray-600 text-sm text-center">
          Unable to load product
        </p>
      </div>
    }
  >
    <ProductCard {...props} />
  </ErrorBoundary>
);

export default ProductCardWithErrorBoundary;
