import { Heart, MapPin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CartIcon from "../../../assets/svgs/cart-icon";
import useDeviceTracking from "../../../hooks/useDeviceTracking";
import useLocationTracking from "../../../hooks/useLocationTracking";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";
import axiosInstance from "../../../utils/axiosinstance";
import { isProtected } from "../../../utils/protected";
import Ratings from "../ratings";

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

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart?.some((item: any) => item.id === data.id);

  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const addToWishList = useStore((state: any) => state.addToWishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist?.some((item: any) => item.id === data.id);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const router = useRouter();

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
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

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
            {/* Seller Info */}
            {/* Seller Info Section */}
            <div className="border-b pb-4 border-gray-200 relative">
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

            {/* price section */}

            <div className="mt-5 flex items-center gap-4">
              <h3 className="text-2xl  font-semibold text-gray-900">
                ${data?.sale_price}
              </h3>
              {data?.regular_price && (
                <h3 className="text-lg text-red-600 line-through">
                  ${data.regular_price}
                </h3>
              )}
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className=" flex items-center rounded-md">
                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>

                <span className="px-4 bg-gray-100 py-1">{quantity}</span>

                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
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
                } `}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
