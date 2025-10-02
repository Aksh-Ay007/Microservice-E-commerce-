"use client";

import { ChevronRight, MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useDeviceTracking from "../../../hooks/useDeviceTracking";
import useLocationTracking from "../../../hooks/useLocationTracking";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";
import CartIcon from "../../../assets/svgs/cart-icon";

const WishlistPage = () => {
  const { user } = useUser();

  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const wishlist = useStore((state: any) => state.wishlist);

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromWishList(id, user, location, deviceInfo);
  };

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        {/* Breadcrumbs */}
        <div className="pb-[40px]">
          <h1 className="md:pt-[40px] font-semibold text-[36px] tracking-tight mb-[12px] font-jost">
            Wishlist
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={"/"} className="hover:underline">
              Home
            </Link>
            <ChevronRight size={18} />
            <span>Wishlist</span>
          </div>
        </div>

        {/* Wishlist Empty */}
        {wishlist.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your wishlist is empty! Start adding products to your wishlist.
          </div>
        ) : (
          <div className="flex flex-col gap-6 overflow-x-auto">
            {/* Wishlist Table */}
            <table className="w-full border-collapse table-auto">
              <thead className="bg-[#f8f9fa] text-gray-700">
                <tr>
                  <th className="py-3 text-left pl-4">Product</th>
                  <th className="py-3 text-right">Price</th>
                  <th className="py-3 text-center">Quantity</th>
                  <th className="py-3 text-center">Action</th>
                  <th className="py-3 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {/* Product Name & Image */}
                    <td className="p-4 align-top">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 max-w-[250px]">
                        <Image
                          src={item.images[0]?.url || "/placeholder.png"}
                          alt={item.title}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                        <span className="font-medium text-gray-800 text-sm md:text-base line-clamp-2 break-words text-center md:text-left">
                          {item.title}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 text-lg text-gray-700 font-medium text-right align-middle">
                      ${item?.sale_price.toFixed(2)}
                    </td>

                    {/* Quantity */}
                    <td className="text-center align-middle">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center border border-gray-300 rounded-full w-[100px] py-1">
                          <button
                            className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                            onClick={() => decreaseQuantity(item?.id)}
                          >
                            <MinusIcon size={14} />
                          </button>
                          <span className="px-4 text-sm font-medium">
                            {item?.quantity ?? 1}
                          </span>
                          <button
                            className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                            onClick={() => increaseQuantity(item?.id)}
                          >
                            <PlusIcon size={14} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Add to Cart */}
                    <td className="text-center align-middle">
                      <button
                        className="bg-[#2295FF] text-white p-2 rounded-md hover:bg-[#007bff] transition-all shadow-sm"
                        onClick={() =>
                          addToCart(item, user, location, deviceInfo)
                        }
                      >
                        <CartIcon />
                      </button>
                    </td>

                    {/* Remove Item */}
                    <td className="text-center align-middle">
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2Icon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
