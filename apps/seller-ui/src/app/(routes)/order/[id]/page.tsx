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
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );

  if (!order)
    return (
      <div className="text-center text-red-400 mt-10">Order not found 😢</div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-100">
      <button
        onClick={() => router.push("/dashboard/orders")}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
      >
        <ArrowLeft size={18} />
        Back to Orders
      </button>

      <h1 className="text-3xl font-bold mt-6 mb-4">
        Order #{order.id.slice(-6).toUpperCase()}
      </h1>

      {/* Status Selector */}
      <div className="bg-[#1C1F29] border border-gray-700 p-4 rounded-xl mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Update Delivery Status
        </label>
        <select
          value={order.deliveryStatus}
          onChange={handleStatusChange}
          disabled={updating}
          className="w-full mt-1 bg-[#0F1117] border border-gray-700 text-white rounded-md p-2 outline-none"
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
      </div>

      {/* Delivery Progress */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between text-sm text-gray-400">
          {statuses.map((step, index) => (
            <span
              key={step}
              className={`${
                statuses.indexOf(order.deliveryStatus) >= index
                  ? "text-green-400"
                  : "text-gray-600"
              }`}
            >
              {step}
            </span>
          ))}
        </div>
        <div className="flex items-center">
          {statuses.map((_, index) => {
            const reached = index <= statuses.indexOf(order.deliveryStatus);
            return (
              <div key={index} className="flex-1 flex items-center">
                <div
                  className={`w-4 h-4 rounded-full ${
                    reached ? "bg-green-500" : "bg-gray-600"
                  }`}
                ></div>
                {index !== statuses.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${
                      reached ? "bg-green-400" : "bg-gray-700"
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#181B25] border border-gray-700 rounded-xl p-5 mb-6 space-y-2">
        <p>
          <span className="font-medium text-gray-400">Payment Status:</span>{" "}
          <span className="text-green-400">{order.status}</span>
        </p>
        <p>
          <span className="font-medium text-gray-400">Total Paid:</span> $
          {order.total.toFixed(2)}
        </p>
        {order.couponCode && (
          <p>
            <span className="font-medium text-gray-400">Coupon:</span>{" "}
            <span className="text-blue-400">
              {order.couponCode.public_name}
            </span>
          </p>
        )}
        <p>
          <span className="font-medium text-gray-400">Date:</span>{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="bg-[#1C1F29] border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <p>{order.shippingAddress.name}</p>
          <p>
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.zip}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
      )}

      {/* Order Items */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-300">Items</h2>
        {order.items.map((item: any) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 bg-[#181B25] border border-gray-700 p-4 rounded-lg"
          >
            <img
              src={item.product.images?.[0]?.url || "/placeholder.png"}
              alt={item.product.title}
              className="w-16 h-16 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{item.product.title}</p>
              <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold">${item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
