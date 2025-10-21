"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import axiosInstance from "../../../utils/axiosinstance";
import { useStore } from "../../../store";

const OrderSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  // Clear cart on success
  useEffect(() => {
    if (orderId) {
      useStore.setState({ cart: [] });
    }
  }, [orderId]);

  // Fetch order details
  const { data: orderData, isLoading } = useQuery({
    queryKey: ["order-details", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await axiosInstance.get(
        `/order/api/get-userOrder-details/${orderId}`
      );
      return res.data.order;
    },
    enabled: !!orderId,
  });

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            No Order Found
          </h2>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const isCOD = orderData?.status?.toLowerCase() === "cash on delivery";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isCOD ? "Order Placed Successfully!" : "Payment Successful!"}
            </h1>
            <p className="text-gray-600 mb-4">
              {isCOD
                ? "Your order has been confirmed. Pay when it's delivered."
                : "Thank you for your purchase!"}
            </p>
            <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-mono font-semibold text-gray-900">
                #{orderId.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Order Details
          </h2>

          {/* Items */}
          <div className="space-y-4 mb-6">
            {orderData?.items?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.product?.title || "Product"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-semibold text-gray-900">
                {isCOD ? "💵 Cash on Delivery" : "💳 Online Payment"}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          {orderData?.shippingAddress && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="font-medium text-gray-900">
                  {orderData.shippingAddress.name}
                </p>
                <p className="text-sm text-gray-600">
                  {orderData.shippingAddress.street},{" "}
                  {orderData.shippingAddress.city}
                </p>
                <p className="text-sm text-gray-600">
                  {orderData.shippingAddress.zip},{" "}
                  {orderData.shippingAddress.country}
                </p>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-green-600">
                ${orderData?.total?.toFixed(2)}
              </span>
            </div>
            {isCOD && (
              <p className="text-sm text-gray-500 mt-2 text-right">
                💡 Pay this amount in cash when your order arrives
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/order/${orderId}`}
            className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            View Order Details
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="flex-1 bg-gray-100 text-gray-900 text-center py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Additional Info for COD */}
        {isCOD && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Cash on Delivery Instructions
            </h3>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>• Keep the exact amount ready for smooth delivery</li>
              <li>• Inspect the package before making payment</li>
              <li>• Payment will be collected by the delivery person</li>
              <li>• You can track your order status in the orders section</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;
