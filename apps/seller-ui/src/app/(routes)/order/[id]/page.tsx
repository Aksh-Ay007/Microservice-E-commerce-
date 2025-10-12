"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../utils/axiosinstance";

const statuses = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const Page = () => {
  const { id } = useParams();
  const orderId = id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(
        `/order/api/get-order-details/${orderId}`
      );
      setOrder(res.data.order);
    } catch (error) {
      console.log("Error fetching order", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e: any) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await axiosInstance.put(`/order/api/update-status/${orderId}`, {
        deliveryStatus: newStatus,
      });
      setOrder((prev: any) => ({ ...prev, deliveryStatus: newStatus }));
    } catch (error) {
      console.log("Error updating order status", error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );

  if (!order)
    return (
      <div className="text-center text-gray-400 mt-20">
        <p className="text-4xl mb-2">😕</p>
        <p>We couldn’t find that order. Try returning to the Orders page.</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-gray-100 space-y-10">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/orders")}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
      >
        <ArrowLeft size={18} />
        Back to Orders
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1C1F29] to-[#20232E] border border-gray-700 rounded-2xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">
          Order #{order.id.slice(-6).toUpperCase()}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Status Selector */}
      <div className="bg-[#181B25] border border-gray-700 p-6 rounded-2xl shadow-md">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Update Delivery Status
        </label>
        <select
          value={order.deliveryStatus}
          onChange={handleStatusChange}
          disabled={updating}
          className="w-full bg-[#0F1117] border border-gray-600 hover:border-gray-500 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          {statuses.map((status) => {
            const currentIndex = statuses.indexOf(order.deliveryStatus);
            const statusIndex = statuses.indexOf(status);
            return (
              <option
                key={status}
                value={status}
                disabled={statusIndex < currentIndex}
              >
                {status}
              </option>
            );
          })}
        </select>
        {updating ? (
          <p className="text-sm text-yellow-400 mt-2 flex items-center gap-1">
            <Loader2 className="animate-spin w-4 h-4" /> Updating status...
          </p>
        ) : (
          <p className="text-sm text-green-400 mt-2">
            Status updated successfully ✔
          </p>
        )}
      </div>

      {/* Delivery Progress */}
      <div className="bg-[#181B25] border border-gray-700 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-100 border-b border-gray-700 pb-3 mb-5">
          Delivery Progress
        </h2>

        <div className="flex flex-col gap-5">
          <div className="flex justify-between text-sm font-medium">
            {statuses.map((step, index) => {
              const reached = statuses.indexOf(order.deliveryStatus) >= index;
              return (
                <span
                  key={step}
                  className={`transition-colors ${
                    reached ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              );
            })}
          </div>

          {/* Progress Line */}
          <div className="relative flex items-center justify-between mt-2">
            <div className="absolute top-1/2 left-0 w-full h-[3px] bg-gray-700 -translate-y-1/2 rounded-full" />
            <div
              className="absolute top-1/2 left-0 h-[3px] bg-green-400 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (statuses.indexOf(order.deliveryStatus) /
                    (statuses.length - 1)) *
                  100
                }%`,
              }}
            />
            {statuses.map((_, index) => {
              const reached = index <= statuses.indexOf(order.deliveryStatus);
              return (
                <div
                  key={index}
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    reached
                      ? "bg-green-500 ring-2 ring-green-300"
                      : "bg-gray-600 ring-1 ring-gray-700"
                  }`}
                >
                  {reached && (
                    <div className="absolute w-2 h-2 bg-green-200 rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two-column Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-[#1A1D27] border border-gray-700 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-3">
            Order Summary
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-gray-400">
                💰 Payment Status:
              </span>{" "}
              <span className="text-green-400">{order.status}</span>
            </p>
            <p>
              <span className="font-medium text-gray-400">💵 Total Paid:</span>{" "}
              ${order.total.toFixed(2)}
            </p>
            {order.couponCode && (
              <p>
                <span className="font-medium text-gray-400">🎟 Coupon:</span>{" "}
                <span className="text-blue-400">
                  {order.couponCode.public_name}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-[#1A1D27] border border-gray-700 rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-3">
              Shipping Address
            </h2>
            <div className="space-y-1 text-sm text-gray-300">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-gray-400">
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.zip}
              </p>
              <p className="text-gray-400">{order.shippingAddress.country}</p>
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-[#181B25] border border-gray-700 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-5">
          Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 bg-[#1C1F29] border border-gray-700 p-4 rounded-lg hover:border-gray-500 hover:shadow-md transition"
            >
              <img
                src={item.product.images?.[0]?.url || "/placeholder.png"}
                alt={item.product.title}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-200">
                  {item.product.title}
                </p>
                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-100">
                ${item.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
