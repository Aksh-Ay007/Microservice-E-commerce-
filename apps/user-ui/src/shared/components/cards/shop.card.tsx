import { ArrowRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    coverBanner?: string;
    address?: string;
    followers?: [];
    rating?: number;
    category?: string;
  };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className="group w-full rounded-xl cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Cover photo */}
      <div className="h-[120px] w-full relative">
        <Image
          src={
            shop?.coverBanner ||
            "https://ik.imagekit.io/AkshayMicroMart/photo/ChatGPT%20Image%20Oct%207,%202025,%2008_19_51%20PM.png?updatedAt=1759854033660"
          }
          alt="Cover"
          fill
          className="object-cover w-full h-full"
        />
        {/* subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Avatar */}
      <div className="relative flex justify-center -mt-8">
        <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
          <Image
            src={
              shop?.avatar ||
              "https://ik.imagekit.io/AkshayMicroMart/photo/3d-cartoon-portrait-person-practicing-law-related-profession%20(1).jpg?updatedAt=1759855179824"
            }
            alt={shop?.name || "Avatar"}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>

      {/* Shop info */}
      <div className="p-4 pb-5 pt-2 text-center">
        <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {shop?.name}
        </h3>

        <p className="text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length || 0} Followers
        </p>

        {/* Address + Rating */}
        <div className="flex items-center justify-center text-xs text-gray-500 mt-3 gap-4 flex-wrap">
          {shop?.address && (
            <span className="flex items-center gap-1 max-w-[140px]">
              <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
              <span className="truncate">{shop?.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {shop.rating ?? "N/A"}
          </span>
        </div>

        {/* Category */}
        {shop?.category && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium capitalize">
              {shop.category}
            </span>
          </div>
        )}

        {/* Visit button */}
        <div className="mt-4">
          <Link
            href={`/shops/${shop.id}`}
            className="inline-flex items-center text-sm text-blue-600 font-medium hover:underline"
          >
            Visit Shop
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
