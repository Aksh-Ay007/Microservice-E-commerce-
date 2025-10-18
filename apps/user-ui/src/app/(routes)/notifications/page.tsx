"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle,
  Clock,
  Filter,
  Loader2,
  Package,
  ShoppingBag,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../utils/axiosinstance";

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

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "Unread" | "Read">("all");

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/get-user-notifications");
      return res.data;
    },
  });

  const notifications: Notification[] = notificationsData?.data || [];

  // Filter notifications
  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.status === filter);

  const unreadCount = notifications.filter(
    (n) => n.status === "Unread"
  ).length;

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      queryClient.setQueryData(["user-notifications"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((n: Notification) =>
            n.id === id ? { ...n, status: "Read" } : n
          ),
        };
      });

      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      // Optimistic update
      queryClient.setQueryData(["user-notifications"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((n: Notification) => n.id !== id),
        };
      });

      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-500 bg-red-50";
      case "high":
        return "border-orange-500 bg-orange-50";
      case "normal":
        return "border-blue-500 bg-blue-50";
      case "low":
        return "border-gray-500 bg-gray-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case "product":
        return <Package className="w-5 h-5 text-green-600" />;
      case "system":
        return <Bell className="w-5 h-5 text-purple-600" />;
      default:
        return <Star className="w-5 h-5 text-yellow-600" />;
    }
  };

  // Format time ago
  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Notifications
                </h1>
                <p className="text-sm text-gray-600">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filter === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("Unread")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filter === "Unread"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("Read")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filter === "Read"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">
                {filter === "all"
                  ? "You're all caught up!"
                  : `No ${filter.toLowerCase()} notifications`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${getPriorityColor(
                  notification.priority
                )} transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        {notification.title}
                        {notification.status === "Unread" && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>

                    {/* Type and Priority badges */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {notification.type}
                      </span>
                      {notification.priority !== "normal" && (
                        <span
                          className={`px-2 py-1 rounded ${
                            notification.priority === "urgent"
                              ? "bg-red-100 text-red-600"
                              : notification.priority === "high"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {notification.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {notification.status === "Unread" && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Redirect link */}
                {notification.redirect_link && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <a
                      href={notification.redirect_link}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                    >
                      View details
                      <span>→</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
