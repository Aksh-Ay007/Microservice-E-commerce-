"use client";

import {
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Tag,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../utils/axiosinstance";

// Helper function to format the order status with icons and colors
const getStatusIconAndColor = (status: string) => {
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case "delivered":
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-100/50",
      };
    case "shipped":
    case "out for delivery":
      return { icon: Truck, color: "text-indigo-600", bg: "bg-indigo-100/50" };
    case "packed":
      return { icon: Package, color: "text-blue-600", bg: "bg-blue-100/50" };
    case "ordered":
    default:
      return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100/50" };
  }
};

const Page = () => {
  const { id } = useParams();
  const orderId = id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosInstance.get(
          `/order/api/get-userOrder-details/${orderId}`
        );
        setOrder(res.data.order);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-red-500 text-base font-medium">
          Order not found. Please check the ID.
        </p>
      </div>
    );
  }

  const statusSteps = [
    "Ordered",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const currentStatus = order.deliveryStatus || "Ordered";
  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.toLowerCase() === currentStatus.toLowerCase()
  );

  const {
    icon: StatusIcon,
    color: statusColorClass,
    bg: statusBgClass,
  } = getStatusIconAndColor(currentStatus);

  const displayOrderId = order.id ? order.id.slice(-8).toUpperCase() : "N/A";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto py-8 lg:py-12">
        {/* Header */}
        <header className="mb-10 border-b border-gray-200 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
            Order <span className="text-indigo-600">#{displayOrderId}</span>
          </h1>
          <p className="text-base text-gray-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Status Tracker & Order Items */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Tracker */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <StatusIcon className={`w-5 h-5 mr-3 ${statusColorClass}`} />
                Current Delivery Status
              </h2>

              <div className="flex justify-between text-xs sm:text-sm mb-4 font-medium -mx-1">
                {statusSteps.map((step, idx) => {
                  const isReached = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  return (
                    <span
                      key={step}
                      className={`flex-1 text-center px-1 ${
                        isCurrent
                          ? "text-indigo-700 font-bold"
                          : isReached
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  );
                })}
              </div>

              {/* Stepper Dots and Lines */}
              <div className="flex items-center justify-between">
                {statusSteps.map((_, idx) => {
                  const isReached = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  const stepColor = isCurrent
                    ? "bg-indigo-600"
                    : isReached
                    ? "bg-green-600"
                    : "bg-white";
                  const borderColor = isCurrent
                    ? "border-indigo-600"
                    : isReached
                    ? "border-green-600"
                    : "border-gray-300";

                  return (
                    <div key={idx} className="flex-1 flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all z-10 ${stepColor} ${borderColor} ${
                          isCurrent ? "scale-110 shadow-lg" : ""
                        }`}
                      />
                      {/* Connecting Line */}
                      {idx !== statusSteps.length - 1 && (
                        <div
                          className={`flex-1 h-1 transition-all ${
                            isReached ? "bg-green-400" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                className={`mt-6 p-3 rounded-lg text-sm font-semibold border ${statusBgClass} ${statusColorClass.replace(
                  "text-",
                  "border-"
                )}`}
              >
                <p>
                  Status Update:{" "}
                  <span className={statusColorClass}>{currentStatus}</span>
                </p>
              </div>
            </div>

            {/* Order Items */}
            {order.items?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-3">
                  Items in Your Order
                </h2>
                <div className="space-y-6">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center">
                      {/* Product Image */}
                      {item.product?.images?.[0] && (
                        <div className="flex-shrink-0 mr-4">
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.title}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-100"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.product?.title || "Product"}
                        </p>
                        {/* Options/Variants */}
                        {item.selectedOptions &&
                          Object.keys(item.selectedOptions).length > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {Object.entries(item.selectedOptions)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" | ")}
                            </p>
                          )}
                        <p className="text-sm text-gray-500 mt-1">
                          Price:{" "}
                          <span className="font-medium">
                            ${item.price.toFixed(2)}
                          </span>{" "}
                          x {item.quantity}
                        </p>
                      </div>

                      {/* Price */}
                      <p className="font-bold text-lg text-gray-900 ml-4 flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* RIGHT COLUMN: Summary, Address, Coupon */}
          <div className="lg:col-span-1 space-y-8">
            {/* Order Summary Card (Price Breakdown) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">
                Payment & Total
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium text-gray-900">
                    ${(order.total - (order.discountAmount || 0)).toFixed(2)}
                  </p>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <p className="text-green-600 font-medium flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Discount Applied
                    </p>
                    <p className="font-medium text-green-600">
                      -${order.discountAmount?.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* A simplified example where shipping is included in the total or 0. Adjust as needed. */}
                <div className="flex justify-between">
                  <p className="text-gray-600">Shipping</p>
                  <p className="font-medium text-gray-900">$0.00</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-900">Order Total</p>
                  <p className="text-2xl font-extrabold text-indigo-700">
                    ${order.total?.toFixed(2)}
                  </p>
                </div>

                <div className="text-center pt-2">
                  <p
                    className={`text-xs font-semibold uppercase ${
                      order.status?.toLowerCase() === "paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    Payment Status: {order.status || "Pending"}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address - Correctly included */}
            {order.shippingAddress && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center border-b pb-3">
                  <MapPin className="w-5 h-5 mr-3 text-indigo-600" />
                  Shipping Address
                </h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.country} {order.shippingAddress.zip}
                  </p>
                </div>
              </div>
            )}

            {/* Coupon Info */}
            {order.couponCode && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl shadow-inner p-6">
                <h2 className="text-lg font-bold text-indigo-700 mb-2">
                  Coupon Used
                </h2>
                <p className="text-sm text-gray-700">
                  Code:{" "}
                  <span className="font-mono font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                    {order.couponCode.discountCode}
                  </span>
                </p>
              </div>
            )}
          </div>{" "}
          {/* End of Right Column */}
        </div>{" "}
        {/* End of Main Content Grid */}
      </div>
    </div>
  );
};

export default Page;
