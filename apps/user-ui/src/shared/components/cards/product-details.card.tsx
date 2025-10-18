"use client";

import { Heart, MapPin, X, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import CartIcon from "../../../assets/svgs/cart-icon";
import useDeviceTracking from "../../../hooks/useDeviceTracking";
import useLocationTracking from "../../../hooks/useLocationTracking";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";
import axiosInstance from "../../../utils/axiosinstance";
import { isProtected } from "../../../utils/protected";
import Ratings from "../ratings";
import ReviewsSection from "../sections/reviews-section";
import { toast } from "sonner";

const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || "");
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart?.some((item: any) => item.id === data.id);

  const addToWishList = useStore((state: any) => state.addToWishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist?.some((item: any) => item.id === data.id);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const router = useRouter();

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      rating: 0,
      title: "",
      review: "",
    },
  });

  const handleChat = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post(
        "/chatting/api/create-user-conversationGroup",
        { sellerId: data.Shop?.sellerId },
        isProtected
      );
      router.push(`/inbox?conversationId=${res.data.conversation.id}`);
    } catch (error) {
      console.error("Error initiating chat:", error);
      toast.error("Failed to start chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  // Rating functions
  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setValue("rating", rating);
  };

  const onSubmitRating = async (formData: any) => {
    if (selectedRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmittingRating(true);
    try {
      // Send as JSON - simple and clean
      await axiosInstance.post(
        "/product/api/ratings",
        {
          productId: data.id,
          rating: selectedRating,
          title: formData.title || "",
          review: formData.review || "",
        },
        {
          ...isProtected,
        }
      );

      toast.success("Rating submitted successfully!");
      reset();
      setSelectedRating(0);
      setShowRatingModal(false);

      // Optionally trigger a refresh of the reviews section
      window.location.reload();
    } catch (error: any) {
      console.error("Rating submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-[90%] md:w-[70%] max-h-[85vh] overflow-y-auto p-4 md:p-6 bg-white shadow-md rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
          onClick={() => setOpen(false)}
        >
          <X size={24} />
        </button>

        <div className="w-full flex flex-col md:flex-row gap-4 mt-4">
          {/* Left: Image Gallery */}
          <div className="w-full md:w-1/2">
            <Image
              src={data?.images?.[activeImage]?.url}
              alt={`Product image ${activeImage + 1} - ${data?.title}`}
              width={350}
              height={350}
              className="w-full h-[300px] md:h-[350px] rounded-lg object-contain"
            />

            {/* Thumbnails */}
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {data?.images?.map((img: any, index: number) => (
                <div
                  key={index}
                  className={`cursor-pointer border rounded-md flex-shrink-0 ${
                    activeImage === index
                      ? "border-gray-500"
                      : "border-transparent"
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={img?.url}
                    alt={`Thumbnail ${index + 1}`}
                    width={60}
                    height={60}
                    className="rounded-md object-cover h-[60px] w-[60px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            {/* Seller Info Section */}
            <div className="border-b pb-4 border-gray-200">
              <div className="flex justify-between items-start">
                {/* Left: Seller Avatar and Info */}
                <div className="flex items-start gap-3">
                  <Image
                    src={
                      data?.Shop?.avatar ||
                      "https://ui-avatars.com/api/?name=Shop&background=3b82f6&color=fff&size=60"
                    }
                    alt="Shop logo"
                    width={60}
                    height={60}
                    className="rounded-full w-[40px] h-[40px] object-cover"
                  />

                  <div>
                    <Link
                      href={`/shop/${data?.Shop?.id}`}
                      className="text-lg font-medium"
                    >
                      {data?.Shop?.name}
                    </Link>
                    <span className="block mt-1">
                      <Ratings rating={data?.Shop?.ratings} />
                    </span>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                      <MapPin size={20} />
                      {data?.Shop?.address || "Location Not Available"}
                    </p>
                  </div>
                </div>

                {/* Right: Chat Button */}
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                  onClick={() => handleChat()}
                >
                  💬 Chat with Seller
                </button>
              </div>
            </div>

            {/* Product Title & Description */}
            <h3 className="text-xl font-semibold mt-4">{data?.title}</h3>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap w-full">
              {data?.short_description}
            </p>

            {/* Brand */}
            {data?.brand && (
              <p className="mt-2">
                <strong>Brand:</strong> {data.brand}
              </p>
            )}

            {/* Color Options */}
            {data?.colors?.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <strong>Color:</strong>
                {data.colors.map((color: string, index: number) => (
                  <button
                    key={index}
                    className={`w-6 h-6 md:w-7 md:h-7 cursor-pointer rounded-full border-2 transition ${
                      isSelected === color
                        ? "border-gray-400 scale-110 shadow-md"
                        : "border-transparent"
                    }`}
                    onClick={() => setIsSelected(color)}
                    style={{
                      backgroundColor: color,
                      border:
                        color.toLowerCase() === "white"
                          ? "1px solid #ccc"
                          : undefined,
                    }}
                    title={color}
                  ></button>
                ))}
              </div>
            )}

            {/* Size Options */}
            {data?.sizes?.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <strong>Size:</strong>
                {data.sizes.map((size: string, index: number) => (
                  <button
                    key={index}
                    className={`px-3 py-1 text-sm md:text-base cursor-pointer rounded-md transition ${
                      isSizeSelected === size
                        ? "bg-gray-800 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                    onClick={() => setIsSizeSelected(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            {/* Price Section */}
            <div className="mt-5 flex items-center gap-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                ${data?.sale_price}
              </h3>
              {data?.regular_price && (
                <h3 className="text-lg text-red-600 line-through">
                  ${data.regular_price}
                </h3>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="mt-5 flex items-center gap-5">
              <div className="flex items-center rounded-md">
                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <span className="px-4 bg-gray-100 py-1">{quantity}</span>
                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md"
                  onClick={() => setQuantity((prev) => Math.max(1, prev + 1))}
                >
                  +
                </button>
              </div>

              <button
                disabled={isInCart}
                onClick={() =>
                  addToCart(
                    {
                      ...data,
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
                className={`flex items-center gap-2 px-4 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${
                  isInCart ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <CartIcon />
                Add to Cart
              </button>

              <button className="opacity-[.7] cursor-pointer">
                <Heart
                  size={30}
                  fill={isWishlisted ? "red" : "transparent"}
                  color={isWishlisted ? "transparent" : "black"}
                  onClick={() =>
                    isWishlisted
                      ? removeFromWishList(data.id, user, location, deviceInfo)
                      : addToWishList(
                          {
                            ...data,
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
              </button>
            </div>

            <div className="mt-3">
              {data.stock > 0 ? (
                <span className="text-green-600 font-semibold">In Stock</span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>

            <div className="mt-3 text-gray-600 text-sm">
              Estimated Delivery{" "}
              <strong>{estimatedDelivery.toDateString()}</strong>
            </div>

            {/* Rating Button */}
            <div className="mt-4">
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Rate & Review This Product
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="w-full mt-6">
          <ReviewsSection
            productId={data.id}
            productTitle={data.title}
            averageRating={data.averageRating || 0}
            totalRatings={data.totalRatings || 0}
          />
        </div>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Rate & Review
                  </h2>
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {data?.title}
                  </h3>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmitRating)}
                  className="space-y-6"
                >
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Your Rating *
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="p-1 transition-colors"
                        >
                          <Star
                            size={32}
                            className={`${
                              star <= (hoveredStar || selectedRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {selectedRating > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedRating === 1 && "Poor"}
                        {selectedRating === 2 && "Fair"}
                        {selectedRating === 3 && "Good"}
                        {selectedRating === 4 && "Very Good"}
                        {selectedRating === 5 && "Excellent"}
                      </p>
                    )}
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Title
                    </label>
                    <input
                      {...register("title")}
                      type="text"
                      placeholder="Summarize your review"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      {...register("review")}
                      rows={4}
                      placeholder="Tell others about your experience with this product"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRatingModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRating || selectedRating === 0}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingRating ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsCard;
