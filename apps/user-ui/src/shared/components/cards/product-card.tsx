import { Eye, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Event ended");
          clearInterval(interval);
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this offer`);
      }, 60000);
      return () => clearInterval(interval);
    }
    return;
  }, [isEvent, product?.ending_date]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group border border-gray-100 relative">
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
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart
                className="hover:scale-110 transition-transform"
                size={20}
                fill={"red"}
                stroke="red"
                strokeWidth={2}
              />
            </div>

            {/* Eye Icon */}
            <div
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
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
              />
            </div>

            {/* Cart Icon */}
            <div
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ShoppingBag
                className="hover:scale-110 transition-transform"
                size={22}
                stroke="#6B7280"
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Product Image */}
          <Image
            src={imageUrl}
            alt={product?.title || "Product image"}
            fill
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
            href={`/shop/${product?.shop?.id}`}
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
