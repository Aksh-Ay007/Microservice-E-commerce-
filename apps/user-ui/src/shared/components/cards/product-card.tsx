import { Eye, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useDeviceTracking from "../../../hooks/useDeviceTracking";
import useLocationTracking from "../../../hooks/useLocationTracking";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";
import Ratings from "../ratings";
import ProductDetailsCard from "./product-details.card";

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
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishList = useStore((state: any) => state.addToWishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist?.some((item: any) => item.id === product.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart?.some((item: any) => item.id === product.id);

  // Intersection Observer to track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Timer only runs when component is visible (Performance fix)
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only start timer if event is active AND component is visible
    if (isEvent && product?.ending_date && isVisible) {
      const updateTimer = () => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Event ended");
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this offer`);
      };

      // Update immediately
      updateTimer();

      // Then update every minute
      timerRef.current = setInterval(updateTimer, 60000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isEvent, product?.ending_date, isVisible]);

  // Memoized callbacks for better performance
  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [
      isWishlisted,
      product,
      user,
      location,
      deviceInfo,
      removeFromWishList,
      addToWishList,
    ]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
    },
    [open]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isInCart) {
        addToCart({ ...product, quantity: 1 }, user, location, deviceInfo);
      }
    },
    [isInCart, product, user, location, deviceInfo, addToCart]
  );

  // Keyboard navigation support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        action();
      }
    },
    []
  );

  return (
    <div
      ref={cardRef}
      className="w-full bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group border border-gray-100 relative"
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

          {/* Action Buttons with proper accessibility */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            {/* Heart Icon - Wishlist */}
            <button
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleWishlistToggle}
              onKeyDown={(e) =>
                handleKeyDown(e, () => handleWishlistToggle(e as any))
              }
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              tabIndex={0}
            >
              <Heart
                className="hover:scale-110 transition-transform"
                size={20}
                fill={isWishlisted ? "red" : "transparent"}
                stroke={isWishlisted ? "red" : "#4B5563"}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>

            {/* Eye Icon - Quick View */}
            <button
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleQuickView}
              onKeyDown={(e) =>
                handleKeyDown(e, () => handleQuickView(e as any))
              }
              aria-label="Quick view product details"
              title="Quick view product"
              tabIndex={0}
            >
              <Eye
                className="hover:scale-110 transition-transform"
                size={20}
                stroke="#6B7280"
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>

            {/* Cart Icon - Add to Cart */}
            <button
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              onKeyDown={(e) =>
                !isInCart && handleKeyDown(e, () => handleAddToCart(e as any))
              }
              disabled={isInCart}
              aria-label={isInCart ? "Product already in cart" : "Add to cart"}
              title={isInCart ? "Already in cart" : "Add to cart"}
              tabIndex={0}
            >
              <ShoppingBag
                className="hover:scale-110 transition-transform"
                size={22}
                stroke={isInCart ? "#10B981" : "#6B7280"}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Product Image with loading and error states */}
          {imageLoading && (
            <div
              className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
              role="status"
              aria-label="Loading product image"
            >
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          {imageError ? (
            <div
              className="absolute inset-0 bg-gray-100 flex items-center justify-center"
              role="img"
              aria-label="Product image unavailable"
            >
              <div className="text-center text-gray-500">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs">No Image</span>
                </div>
                <p className="text-xs">Image unavailable</p>
              </div>
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
              priority={false}
              loading="lazy"
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
            className="inline-block text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            tabIndex={0}
          >
            {product.Shop.name}
          </Link>
        )}

        {/* Product Title */}
        <Link
          href={`/product/${product?.slug}`}
          className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          tabIndex={0}
        >
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors min-h-[40px]">
            {product?.title}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="mt-2 flex items-center gap-2">
          <Ratings rating={product?.averageRating || 0} />
          {product?.totalRatings > 0 && (
            <span className="text-xs text-gray-500">
              ({product.totalRatings})
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold text-gray-900"
              aria-label={`Sale price $${product?.sale_price}`}
            >
              ${product?.sale_price}
            </span>
            {product?.regular_price &&
              product?.regular_price !== product?.sale_price && (
                <span
                  className="text-sm line-through text-gray-400"
                  aria-label={`Regular price $${product?.regular_price}`}
                >
                  ${product?.regular_price}
                </span>
              )}
          </div>
          {product?.totalSales > 0 && (
            <span
              className="text-green-500 text-sm font-medium"
              aria-label={`${product.totalSales} units sold`}
            >
              {product.totalSales} sold
            </span>
          )}
        </div>

        {/* Timer for events */}
        {isEvent && timeLeft && (
          <div className="mt-2" role="timer" aria-live="polite">
            <span className="inline-block text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              {timeLeft}
            </span>
          </div>
        )}
      </div>

      {/* Modal rendered conditionally */}
      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
    </div>
  );
};

export default ProductCard;
