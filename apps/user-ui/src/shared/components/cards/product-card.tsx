import { Eye, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
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

  const handleActivate = (
    e: React.KeyboardEvent,
    action: () => void
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      action();
    }
  };

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      { root: null, threshold: 0 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!(isEvent && product?.ending_date && isVisible)) return;

    const endTime = new Date(product.ending_date).getTime();
    const update = () => {
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeLeft("Event ended");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m left with this offer`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [isEvent, product?.ending_date, isVisible]);

  return (
    <div ref={cardRef} className="w-full bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group border border-gray-100 relative">
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
            <div
              role="button"
              tabIndex={0}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              aria-pressed={isWishlisted}
              title={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) =>
                handleActivate(e, () => {
                  isWishlisted
                    ? removeFromWishList(
                        product.id,
                        user,
                        location,
                        deviceInfo
                      )
                    : addToWishList(
                        { ...product, quantity: 1 },
                        user,
                        location,
                        deviceInfo
                      );
                })
              }
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
            >
              <Heart
                className="hover:scale-110 transition-transform"
                size={20}
                fill={isWishlisted ? "red" : "transparent"}
                stroke={isWishlisted ? "red" : "#4B5563"}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>

            {/* Eye Icon */}
            <div
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label="Quick view product details"
              title="Quick view product details"
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => handleActivate(e, () => setOpen(!open))}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              <Eye
                className="hover:scale-110 transition-transform"
                size={20}
                stroke="#6B7280"
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>

            {/* Cart Icon */}
            <div
              role="button"
              tabIndex={0}
              aria-label={isInCart ? "Already in cart" : "Add to cart"}
              aria-disabled={isInCart}
              title={isInCart ? "Already in cart" : "Add to cart"}
              className={`bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isInCart ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onKeyDown={(e) =>
                handleActivate(e, () => {
                  if (isInCart) return;
                  addToCart(
                    { ...product, quantity: 1 },
                    user,
                    location,
                    deviceInfo
                  );
                })
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isInCart) return;
                addToCart(
                  { ...product, quantity: 1 },
                  user,
                  location,
                  deviceInfo
                );
              }}
            >
              <ShoppingBag
                className="hover:scale-110 transition-transform"
                size={22}
                stroke="#6B7280"
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Image Loading/Error States */}
          {!imageLoaded && !imageError && (
            <div
              className="absolute inset-0 bg-gray-200 animate-pulse"
              aria-hidden="true"
            />
          )}
          <Image
            src={imageError ? "https://via.placeholder.com/400x300?text=Image+unavailable" : imageUrl}
            alt={product?.title || "Product image"}
            fill
            priority={false}
            onLoadingComplete={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
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

export default ProductCard;
