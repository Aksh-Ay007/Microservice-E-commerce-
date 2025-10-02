"use client";

import {
  ChevronRight,
  Loader2,
  MinusIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useDeviceTracking from "../../../hooks/useDeviceTracking";
import useLocationTracking from "../../../hooks/useLocationTracking";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const cart = useStore((state: any) => state.cart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);

  const [discountedProductId, setDiscountedProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(false);

  // Quantity update handlers
  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromCart(id, user, location, deviceInfo);
  };

  const subTotal = cart.reduce(
    (total: number, item: any) =>
      total + (item.quantity ?? 1) * item.sale_price,
    0
  );

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        {/* Breadcrumbs */}
        <div className="pb-[40px]">
          <h1 className="md:pt-[40px] font-semibold text-[36px] md:text-[44px] leading-[1.2] mb-[12px] font-jost">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Link href={"/"} className="text-[#55585b] hover:underline">
              Home
            </Link>
            <ChevronRight size={18} />
            <span className="text-[#55585b]">Cart</span>
          </div>
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="text-center text-gray-600 text-lg py-20">
            Your cart is empty! Start adding products to your cart.
          </div>
        ) : (
          <div className="lg:flex items-start gap-10">
            {/* Cart Items */}
            <div className="w-full lg:w-[70%] overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-[#f8f9fa] text-left text-gray-700 font-medium">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4 text-center">Price</th>
                    <th className="p-4 text-center">Quantity</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item: any) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      {/* Product Info */}
                      <td className="p-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 max-w-[300px]">
                          <Image
                            src={item.images[0]?.url || "/placeholder.png"}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                          />
                          <div className="flex flex-col items-center sm:items-start gap-1">
                            <span className="font-medium text-center sm:text-left break-words leading-snug">
                              {item.title}
                            </span>
                            {item?.selectedOptions && (
                              <div className="text-sm text-gray-500 flex gap-2">
                                {item?.selectedOptions?.color && (
                                  <span className="flex items-center gap-1">
                                    Color:
                                    <span
                                      style={{
                                        backgroundColor:
                                          item?.selectedOptions?.color,
                                        width: "12px",
                                        height: "12px",
                                        borderRadius: "100%",
                                        display: "inline-block",
                                      }}
                                    />
                                  </span>
                                )}
                                {item?.selectedOptions?.size && (
                                  <span>
                                    Size: {item?.selectedOptions?.size}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="text-center align-middle">
                        {item?.id === discountedProductId ? (
                          <div className="flex flex-col items-center">
                            <span className="line-through text-gray-500 text-sm">
                              ${item.sale_price.toFixed(2)}
                            </span>
                            <span className="text-green-600 font-semibold">
                              $
                              {(
                                (item.sale_price * (100 - discountPercent)) /
                                100
                              ).toFixed(2)}
                            </span>
                            <span className="text-xs text-green-700">
                              Discount Applied
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">
                            ${item?.sale_price.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                            onClick={() => decreaseQuantity(item?.id)}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-2">{item?.quantity ?? 1}</span>
                          <button
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                            onClick={() => increaseQuantity(item?.id)}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                      {/* Remove */}
                      <td className="text-center">
                        <button
                          className="text-gray-500 hover:text-red-600 transition"
                          onClick={() => removeItem(item?.id)}
                        >
                          <Trash2Icon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9] rounded-lg mt-6 lg:mt-0">
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-gray-700 text-sm font-medium pb-1">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="text-green-600">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-gray-900 text-lg font-semibold pb-3">
                <span>Subtotal</span>
                <span>${(subTotal - discountAmount).toFixed(2)}</span>
              </div>
              <hr className="my-4" />

              {/* Coupon */}
              <div className="mb-4">
                <h4 className="mb-2 font-medium text-sm">Have a Coupon?</h4>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e: any) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:border-blue-500"
                  />
                  <button className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 transition">
                    Apply
                  </button>
                </div>
              </div>
              <hr className="my-4" />

              {/* Shipping Address */}
              <div className="mb-4">
                <h4 className="mb-2 font-medium text-sm">
                  Select Shipping Address
                </h4>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                >
                  <option value="123">Home - Kochi, India</option>
                </select>
              </div>
              <hr className="my-4" />

              {/* Payment Method */}
              <div className="mb-4">
                <h4 className="mb-2 font-medium text-sm">
                  Select Payment Method
                </h4>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                  <option value="credit_card">Online Payment</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                </select>
              </div>
              <hr className="my-4" />

              {/* Total */}
              <div className="flex justify-between items-center text-gray-900 text-lg font-semibold pb-3">
                <span>Total</span>
                <span>${(subTotal - discountAmount).toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989FF] transition rounded-lg"
              >
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? "Redirecting..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
