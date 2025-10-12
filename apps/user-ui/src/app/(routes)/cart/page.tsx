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
import { toast } from "sonner";
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
  const [error, setError] = useState("");
  const [storedCouponCode, setStoredCouponCode] = useState("");

  const couponCodeApplyHandler = async () => {
    setError("");
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    try {
      const res = await axiosInstance.put("/order/api/verify-coupon", {
        couponCode: couponCode.trim(),
        cart,
      });

      if (res.data.valid) {
        setStoredCouponCode(couponCode.trim());
        setDiscountAmount(parseFloat(res.data.discountAmount));
        setDiscountPercent(res.data.discount);
        setDiscountedProductId(res.data.discountedProductId);
        setCouponCode("");
      } else {
        setDiscountAmount(0);
        setDiscountPercent(0);
        setDiscountedProductId("");
        setError(res.data.message || "Invalid or inapplicable coupon code");
      }
    } catch (error: any) {
      setDiscountAmount(0);
      setDiscountPercent(0);
      setDiscountedProductId("");
      setError(error?.response?.data?.message);
    }
  };

  const { data: addresses = [] } = useQuery<any[], Error>({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses, selectedAddressId]);

  const createPaymentSession = async () => {
    if (addresses.length === 0) {
      toast.error("Please add a shipping address to create an Order!.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "/order/api/create-payment-session",
        {
          cart,
          selectedAddressId,
          coupon: {
            code: storedCouponCode,
            discountPercent,
            discountAmount,
            discountedProductId,
          },
        }
      );
      router.push(`/checkout?sessionId=${res.data.sessionId}`);
    } catch {
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

  const removeItem = (id: string) =>
    removeFromCart(id, user, location, deviceInfo);

  const subTotal = cart.reduce(
    (total: number, item: any) => total + item.quantity * item.sale_price,
    0
  );

  return (
    <div className="w-full bg-white min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header + Breadcrumb */}
        <div className="pb-8 border-b border-gray-200 mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight size={16} />
            <span>Cart</span>
          </div>
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="text-center py-24 text-gray-600 text-lg">
            Your cart is empty. Start adding products to your cart.
          </div>
        ) : (
          <div className="lg:flex lg:items-start gap-8">
            {/* Left: Cart Items */}
            <div className="flex-1 space-y-4">
              {cart.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-5 border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <Image
                        src={item.images[0]?.url}
                        alt={item.title}
                        fill
                        className="object-cover rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-gray-900 text-base">
                        {item.title}
                      </p>
                      {item?.selectedOptions && (
                        <div className="text-xs text-gray-500 flex gap-3">
                          {item.selectedOptions.color && (
                            <span className="flex items-center gap-1">
                              Color:
                              <span
                                style={{
                                  backgroundColor: item?.selectedOptions?.color,
                                  width: "12px",
                                  height: "12px",
                                  borderRadius: "100%",
                                  display: "inline-block",
                                }}
                              />
                            </span>
                          )}
                          {item.selectedOptions.size && (
                            <span>Size: {item?.selectedOptions?.size}</span>
                          )}
                        </div>
                      )}
                      {item.id === discountedProductId ? (
                        <div className="flex flex-col">
                          <span className="line-through text-gray-500 text-sm">
                            ${item.sale_price.toFixed(2)}
                          </span>
                          <span className="text-green-600 font-semibold text-sm">
                            $
                            {(
                              (item.sale_price * (100 - discountPercent)) /
                              100
                            ).toFixed(2)}
                          </span>
                          <span className="text-xs text-green-700 bg-green-100 px-2 rounded mt-1">
                            Discount Applied
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-800 mt-1">
                          ${item.sale_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-5">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        className="p-2 hover:bg-gray-100"
                        onClick={() => decreaseQuantity(item?.id)}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="px-3 text-sm font-medium">
                        {item.quantity ?? 1}
                      </span>
                      <button
                        className="p-2 hover:bg-gray-100"
                        onClick={() => increaseQuantity(item?.id)}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item?.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2Icon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Summary */}
            <div className="w-full lg:w-[32%] bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-8 lg:mt-0">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Order Summary
              </h3>

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-700 mb-2">
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
                <label className="block text-sm font-medium mb-1">
                  Have a Coupon?
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                  <button
                    className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 text-sm font-medium"
                    onClick={couponCodeApplyHandler}
                  >
                    Apply
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              {/* Shipping Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Shipping Address
                </label>
                {addresses.length > 0 ? (
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
              <div className="mb-5">
                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500">
                  <option value="credit_card">Online Payment</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                </select>
              </div>

              {/* Total */}
              <div className="flex justify-between text-gray-900 font-semibold text-base mb-4">
                <span>Total</span>
                <span>${(subTotal - discountAmount).toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={createPaymentSession}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#010f1c] text-white hover:bg-[#0989FF] transition rounded-lg text-sm font-medium"
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
