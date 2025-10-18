"use client";

import DOMPurify from "isomorphic-dompurify";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  WalletMinimal,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CartIcon from "../../../assets/svgs/cart-icon";
import useDeviceTracking from "../../../hooks/useDeviceTracking";
import useLocationTracking from "../../../hooks/useLocationTracking";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";
import axiosInstance from "../../../utils/axiosinstance";
import ProductCard from "../../components/cards/product-card";
import Ratings from "../../components/ratings";
import ReviewsSection from '../../components/sections/reviews-section';

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSelected, setIsSelected] = useState(
    productDetails?.colors?.[0] || ""
  );

  const [isSizeSelected, setIsSizeSelected] = useState(
    productDetails?.sizes?.[0] || ""
  );

  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState([
    productDetails?.sale_price,
    1199,
  ]);

  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart?.some((item: any) => item.id === productDetails.id);
  const addToWishList = useStore((state: any) => state.addToWishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist?.some(
    (item: any) => item.id === productDetails.id
  );

  const { user, isLoading } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const [currentImage, setCurrentImage] = useState(
    productDetails?.images?.[0]?.url ||
      "https://ik.imagekit.io/demo/img/image4.jpeg"
  );

  const prevImage = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentImage(productDetails?.images?.[newIndex]?.url);
    }
  };

  const nextImage = () => {
    if (currentIndex < productDetails?.images?.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentImage(productDetails?.images?.[newIndex]?.url);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const discountPercentage = Math.round(
    ((productDetails?.regular_price - productDetails?.sale_price) /
      productDetails?.regular_price) *
      100
  );

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();

      query.set("priceRange", priceRange.join(","));

      query.set("page", "1");
      query.set("limit", "5");
      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?${query.toString()}`
      );


      setRecommendedProducts(res.data.products);
    } catch (error) {
      console.log("Error fetching filtered products", error);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [priceRange]);

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto rounded-xl shadow-lg overflow-hidden">
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-[58%_42%] gap-6">
          {/* Left Section - Images and Details */}
          <div className="grid grid-cols-1 md:grid-cols-[45%_55%] gap-6 p-6">
            {/* Product Images Section */}
            <div>
              <div
                className="relative w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200 group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  alt="Product Image"
                  src={currentImage}
                  className="w-full h-auto object-contain p-4"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={20} className="text-gray-600" />
                </div>
                {discountPercentage > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                    -{discountPercentage}%
                  </div>
                )}
              </div>

              {/* Product thumbnails */}
              <div className="relative flex items-center gap-2 mt-4 overflow-hidden">
                {productDetails?.images?.length > 4 && (
                  <button
                    className="absolute left-0 z-10 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg transition-all"
                    onClick={prevImage}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {productDetails?.images?.map((image: any, index: number) => (
                    <Image
                      key={index}
                      src={
                        image?.url ||
                        "https://ik.imagekit.io/demo/img/image4.jpeg"
                      }
                      alt="Thumbnail"
                      width={70}
                      height={70}
                      className={`cursor-pointer rounded-lg border-2 transition-all hover:scale-105 ${
                        currentImage === image.url
                          ? "border-orange-500 shadow-md"
                          : "border-gray-200"
                      }`}
                      onClick={() => {
                        setCurrentImage(image.url);
                        setCurrentIndex(index);
                      }}
                    />
                  ))}
                </div>

                {productDetails?.images?.length > 4 && (
                  <button
                    className="absolute right-0 z-10 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg transition-all"
                    onClick={nextImage}
                    disabled={
                      currentIndex === productDetails?.images?.length - 1
                    }
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Zoomed Image Preview - Only shows on hover */}
            {isZoomed && (
              <div className="hidden md:block sticky top-6 w-full h-[400px] bg-white rounded-lg border-2 border-orange-500 overflow-hidden shadow-xl animate-in fade-in duration-200">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${currentImage})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: "200%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Section - Product Info & Seller */}
          <div className="border-l border-gray-200">
            {/* Product Details */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 leading-tight">
                  {productDetails?.title}
                </h1>
                <Heart
                  size={28}
                  fill={isWishlisted ? "#ef4444" : "transparent"}
                  className="cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                  color={isWishlisted ? "#ef4444" : "#9ca3af"}
                  onClick={() =>
                    isWishlisted
                      ? removeFromWishList(
                          productDetails.id,
                          user,
                          location,
                          deviceInfo
                        )
                      : addToWishList(
                          {
                            ...productDetails,
                            quantity,
                            selectedOptions: {
                              color: isSelected,
                              size: isSizeSelected,
                            },
                          },
                          user,
                          location,
                          deviceInfo
                        )
                  }
                />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Ratings rating={productDetails?.ratings || 0} />
                <Link
                  href={"#reviews"}
                  className="text-blue-600 hover:underline text-sm"
                >
                  (0 reviews)
                </Link>
              </div>

              <div className="mt-3 py-3 border-y border-gray-200">
                <span className="text-sm text-gray-600">
                  Brand:{" "}
                  <span className="text-blue-600 font-medium">
                    {productDetails?.brand || "No brand"}
                  </span>
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-orange-500">
                    ${productDetails?.sale_price}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    ${productDetails?.regular_price}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {/* Color options */}
                {productDetails?.colors?.length > 0 && (
                  <div>
                    <strong className="text-sm text-gray-700 block mb-2">
                      Color: <span className="text-gray-900">{isSelected}</span>
                    </strong>
                    <div className="flex gap-2">
                      {productDetails?.colors?.map(
                        (color: string, index: number) => (
                          <button
                            key={index}
                            className={`w-10 h-10 cursor-pointer rounded-full border-2 transition-all hover:scale-110 ${
                              isSelected === color
                                ? "border-gray-800 ring-2 ring-offset-2 ring-gray-400"
                                : "border-gray-300"
                            }`}
                            onClick={() => setIsSelected(color)}
                            style={{ backgroundColor: color }}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Size options */}
                {productDetails?.sizes?.length > 0 && (
                  <div>
                    <strong className="text-sm text-gray-700 block mb-2">
                      Size:{" "}
                      <span className="text-gray-900">{isSizeSelected}</span>
                    </strong>
                    <div className="flex gap-2">
                      {productDetails?.sizes?.map(
                        (size: string, index: number) => (
                          <button
                            key={index}
                            className={`px-5 py-2 cursor-pointer rounded-lg border-2 transition-all font-medium ${
                              isSizeSelected === size
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => setIsSizeSelected(size)}
                          >
                            {size}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <strong className="text-sm text-gray-700 block mb-2">
                  Quantity
                </strong>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      className="px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                    >
                      -
                    </button>
                    <span className="px-6 py-2 bg-white font-medium min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      className="px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
                      onClick={() => setQuantity((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>

                  {productDetails?.stock > 0 ? (
                    <span className="text-green-600 font-semibold text-sm">
                      In Stock{" "}
                      <span className="text-gray-500 font-normal">
                        ({productDetails?.stock} available)
                      </span>
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Out of Stock
                    </span>
                  )}
                </div>

                <button
                  className={`flex mt-6 items-center justify-center gap-3 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${
                    isInCart || productDetails?.stock === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  disabled={isInCart || productDetails?.stock === 0}
                  onClick={() =>
                    addToCart(
                      {
                        ...productDetails,
                        quantity,
                        selectedOptions: {
                          color: isSelected,
                          size: isSizeSelected,
                        },
                      },
                      user,
                      location,
                      deviceInfo
                    )
                  }
                >
                  <CartIcon />
                  {isInCart ? "Already in Cart" : "Add to Cart"}
                </button>
              </div>
            </div>

            {/* Seller Info Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white p-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Delivery Option
                </span>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={20} className="text-orange-500" />
                  <div>
                    <span className="font-semibold">{location?.city}</span>
                    <span className="text-gray-500">, {location?.country}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">
                  Return & Warranty
                </span>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700 gap-2">
                    <Package size={18} className="text-orange-500" />
                    <span className="text-sm">7 Days Returns</span>
                  </div>
                  <div className="flex items-center text-gray-700 gap-2">
                    <WalletMinimal size={18} className="text-orange-500" />
                    <span className="text-sm">
                      {productDetails.warranty || "No"} Year Warranty
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                      Sold by
                    </span>
                    <span className="block max-w-[180px] truncate font-semibold text-lg text-gray-800">
                      {productDetails?.Shop?.name || "No Shop Name"}
                    </span>
                  </div>

                  <Link
                    href={"#"}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 font-medium transition-colors"
                  >
                    <MessageSquareText size={18} />
                    Chat
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-white rounded-lg p-3 border border-gray-200">
                  <div>
                    <p className="text-[11px] text-gray-500 mb-1">
                      Positive Rating
                    </p>
                    <p className="text-lg font-bold text-green-600">88%</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-500 mb-1">Ship Time</p>
                    <p className="text-lg font-bold text-blue-600">100%</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-500 mb-1">Response</p>
                    <p className="text-lg font-bold text-purple-600">100%</p>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Link
                    href={`/shop/${productDetails?.Shop.id}`}
                    className="inline-block w-full py-2 text-blue-600 hover:text-white hover:bg-blue-600 font-medium text-sm border-2 border-blue-600 rounded-lg transition-all"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product description and reviews */}
      <div className="w-[90%] lg:w-[80%] mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">
            Product Details
          </h3>

          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                productDetails?.detailed_description ||
                  "<p>No description available</p>"
              ),
            }}
          />
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto mt-6">
        <ReviewsSection
          productId={productDetails?.id}
          productTitle={productDetails?.title}
          averageRating={productDetails?.averageRating || 0}
          totalRatings={productDetails?.totalRatings || 0}
        />
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            You May Also Like
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {recommendedProducts?.map((i: any) => (
              <ProductCard key={i.id} product={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
