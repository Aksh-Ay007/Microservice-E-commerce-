import { ArrowRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    followers?: [];
    rating?: number;
    category?: string;
    // ✅ Fix: Update interface to match actual data structure
    avatar?: {
      id: string;
      url: string;
      file_id: string;
    } | null;
    coverBanner?: {
      id: string;
      url: string;
      file_id: string;
    } | null;
    // ✅ Add direct URL access for convenience
    avatarUrl?: string | null;
    bannerUrl?: string | null;
  };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  // ✅ Fix: Get avatar and banner URLs with proper fallbacks
  const getAvatarUrl = () => {
    return  shop?.avatar?.url || "https://ik.imagekit.io/AkshayMicroMart/photo/3d-cartoon-portrait-person-practicing-law-related-profession%20(1).jpg?updatedAt=1759855179824";
  };

  const getBannerUrl = () => {
    return  shop?.coverBanner?.url || "https://ik.imagekit.io/AkshayMicroMart/photo/ChatGPT%20Image%20Oct%207,%202025,%2008_19_51%20PM.png?updatedAt=1759854033660";
  };

  return (
    <div className="group w-full rounded-xl cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Cover photo */}
      <div className="h-[100px] sm:h-[120px] w-full relative">
        <Image
          src={getBannerUrl()}
          alt="Cover"
          fill
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Avatar */}
      <div className="relative flex justify-center -mt-8 sm:-mt-9">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
          <Image
            src={getAvatarUrl()}
            alt={shop?.name || "Avatar"}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 text-center">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
          {shop?.name}
        </h3>

        <p className="text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length || 0} Followers
        </p>

        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-3 flex-wrap">
          {shop?.address && (
            <span className="flex items-center gap-1 max-w-[120px] sm:max-w-[150px] truncate">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{shop?.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            {shop.rating ?? "N/A"}
          </span>
        </div>

        {shop?.category && (
          <div className="mt-2">
            <span className="bg-blue-50 text-blue-600 px-2 py-[2px] rounded-full text-[11px] sm:text-xs font-medium capitalize">
              {shop.category}
            </span>
          </div>
        )}

        <div className="mt-3">
          <Link
            href={`/shop/${shop.id}`}
            className="inline-flex items-center text-xs sm:text-sm text-blue-600 font-medium hover:underline"
          >
            Visit Shop
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
