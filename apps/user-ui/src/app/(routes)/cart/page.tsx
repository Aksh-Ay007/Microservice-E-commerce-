"use client";

import { useQuery } from "@tanstack/react-query";
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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useDeviceTracking from "../../../hooks/useDeviceTracking";
import useLocationTracking from "../../../hooks/useLocationTracking";
import useUser from "../../../hooks/useUser";
import { useStore } from "../../../store";
import axiosInstance from "../../../utils/axiosinstance";

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

  const createPaymentSession = async () => {
    setLoading(true);

    try {
      const res = await axiosInstance.post(
        "/order/api/create-payment-session",
        {
          cart,
          selectedAddressId,
          coupon: {},
        }
      );

      const sessionId = res.data.sessionId;
      router.push(`/checkout?sessionId=${sessionId}`);
    } catch (error) {
      toast.error("Error initiating checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const { data: addresses = [] } = useQuery<any[], Error>({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

useEffect(() => {
  if (addresses.length > 0 && !selectedAddressId) {
    // ✅ FIX: use correct property name from backend
    const defaultAddress = addresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
  }
}, [addresses, selectedAddressId]);


  return (
    <div className="w-full bg-white min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Breadcrumbs */}
        <div className="pb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-jost text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight size={16} />
            <span>Cart</span>
          </div>
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="text-center text-gray-600 text-lg py-20">
            Your cart is empty. Start adding products to your cart.
          </div>
        ) : (
          <div className="lg:flex lg:items-start gap-8">
            {/* Cart Items */}
            <div className="flex-1 w-full overflow-hidden">
              <div className="flex flex-col gap-4">
                {cart.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                  >
                    {/* Product Image + Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0">
                        <Image
                          src={item.images[0]?.url || "/placeholder.png"}
                          alt={item.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {item.title}
                        </p>
                        {item?.selectedOptions && (
                          <div className="text-xs text-gray-500 flex gap-2">
                            {item.selectedOptions.color && (
                              <span className="flex items-center gap-1">
                                Color:
                                <span
                                  style={{
                                    backgroundColor:
                                      item.selectedOptions.color || "#ccc",
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "100%",
                                    display: "inline-block",
                                  }}
                                />
                              </span>
                            )}
                            {item.selectedOptions.size && (
                              <span>Size: {item.selectedOptions.size}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity + Price + Remove */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-between">
                      {/* Quantity */}
                      <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2">
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium px-1">
                          {item.quantity ?? 1}
                        </span>
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-sm font-semibold text-gray-900">
                        ${item.sale_price.toFixed(2)}
                      </div>

                      {/* Remove */}
                      <button
                        className="text-gray-400 hover:text-red-500 transition"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="w-full lg:w-[32%] bg-gray-50 border border-gray-200 rounded-xl p-5 mt-6 lg:mt-0">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Order Summary
              </h3>

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="text-green-600">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-gray-900 font-semibold mb-3">
                <span>Subtotal</span>
                <span>${(subTotal - discountAmount).toFixed(2)}</span>
              </div>

              {/* Coupon */}
              <div className="mb-4">
                <label className="block text-sm mb-2 font-medium">
                  Have a Coupon?
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                  <button className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 text-sm">
                    Apply
                  </button>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-4">
                <label className="block text-sm mb-2 font-medium">
                  Shipping Address
                </label>
                {addresses.length !== 0 ? (
                  <select
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    {addresses.map((address: any) => (
                      <option key={address.id} value={address.id}>
                        {address.label}, {address.city}, {address.country}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-500">
                    No saved addresses. Please add one during checkout.
                  </p>
                )}
              </div>

              {/* Payment */}
              <div className="mb-4">
                <label className="block text-sm mb-2 font-medium">
                  Payment Method
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500">
                  <option value="credit_card">Online Payment</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                </select>
              </div>

              {/* Total */}
              <div className="flex justify-between text-gray-900 font-semibold text-base mb-3">
                <span>Total</span>
                <span>${(subTotal - discountAmount).toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={createPaymentSession}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989FF] transition rounded-lg text-sm font-medium"
              >
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? "Redirecting..." : "Proceed to Chec     kout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
