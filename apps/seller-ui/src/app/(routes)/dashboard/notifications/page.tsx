"use client";

import { useEffect, useState } from "react";
import { Bell, Eye, EyeOff, Trash2 } from "lucide-react";
import axiosInstance from "../../../../utils/axiosinstance";

interface Notification {
  id: string;
  title: string;
  message: string;
  status: "Read" | "Unread";
  type: "order" | "product" | "system" | "general";
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  redirect_link?: string;
}

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/seller/api/seller-notifications");
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching seller notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-600";
      case "high":
        return "bg-orange-100 text-orange-600";
      case "normal":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Updates related to your shop and orders</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between hover:bg-gray-50 transition ${
                  n.status === "Unread" ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{n.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityBadge(n.priority)}`}>
                      {n.priority}
                    </span>
                    {n.status === "Unread" && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{n.message}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {n.status === "Unread" ? (
                    <button
                      className="p-1 text-gray-400 hover:text-blue-600 transition"
                      title="Mark as read"
                      onClick={() => {
                        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, status: "Read" } : x)));
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="p-1 text-gray-300" title="Already read">
                      <EyeOff className="w-4 h-4" />
                    </span>
                  )}
                  <button
                    className="p-1 text-gray-400 hover:text-red-600 transition"
                    title="Remove"
                    onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
