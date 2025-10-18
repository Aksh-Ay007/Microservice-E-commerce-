"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BadgeCheck,
  Bell,
  Camera,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit3,
  Gift,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Menu,
  PhoneCall,
  Receipt,
  Save,
  Settings,
  ShoppingBag,
  Star,
  Truck,
  Upload,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useRequireAuth from "../../../hooks/useRequiredAuth";
import QuickActionCard from "../../../shared/components/cards/quick-action.card";
import StatCard from "../../../shared/components/cards/stat.card";
import ChangePassword from "../../../shared/components/change-password";
import ShippingAddressSection from "../../../shared/components/shippingAddress";
import OrderTable from "../../../shared/components/tables/order-table";
import axiosInstance from "../../../utils/axiosinstance";
import { useState as useReactState } from "react";

const ProfilePage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useReactState<any[]>([]);
  const [notifLoading, setNotifLoading] = useReactState(false);

  const { user, isLoading } = useRequireAuth();

  const { data: orders = [] } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-user-orders");
      return res.data.orders;
    },
  });

  const totalOrders = orders.length;
  const processedOrders = orders.filter(
    (o: any) =>
      o?.deliveryStatus !== "Delivered" && o?.deliveryStatus !== "Cancelled"
  ).length;
  const completedOrders = orders.filter(
    (order: any) => order?.deliveryStatus === "Delivered"
  ).length;

  const queryTab = searchParams.get("active") || "Profile";
  const [activeTab, setActiveTab] = useState(queryTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeTab !== queryTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("active", activeTab);
      router.replace(`/profile?${newParams.toString()}`);
    }
  }, [activeTab]);

  // Initialize edit form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        setNotifLoading(true);
        const res = await axiosInstance.get("/api/get-user-notifications");
        setNotifications(res.data?.data || []);
      } catch (e) {
        // silent
      } finally {
        setNotifLoading(false);
      }
    };
    loadNotifs();
  }, []);

  const logOutHandler = async () => {
    await axiosInstance.get("/api/logout-user").then(() => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/login");
    });
  };

  // Smart image compression function - FIXED
  const compressImage = (
    file: File,
    maxWidth: number = 400,
    quality: number = 0.85
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image(); // Use window.Image() instead of Image from Next.js

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = Math.round(img.width * ratio);
        const newHeight = Math.round(img.height * ratio);

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        const tryCompress = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                if (blob.size > 2 * 1024 * 1024 && q > 0.3) {
                  tryCompress(q - 0.1);
                  return;
                }

                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            q
          );
        };

        tryCompress(quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Base64 conversion function
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file selection and preview
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error(
        "Image size must be less than 50MB. Please choose a smaller image."
      );
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setSelectedFile(file);

      setCompressionInfo(`Processing ${formatFileSize(file.size)}...`);

      const compressedFile = await compressImage(file, 400, 0.85);
      setSelectedFile(compressedFile);

      const compressionRatio = Math.round(
        (1 - compressedFile.size / file.size) * 100
      );
      setCompressionInfo(
        `Compressed: ${formatFileSize(file.size)} → ${formatFileSize(
          compressedFile.size
        )} (${compressionRatio}% smaller)`
      );

      if (compressionRatio > 50) {
        toast.success(`Image optimized! Reduced by ${compressionRatio}%`);
      } else if (compressionRatio > 20) {
        toast.success(`Image compressed by ${compressionRatio}%`);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Error processing image. Please try again.");
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    if (isUploading) {
      console.log("⚠️ Upload already in progress, ignoring...");
      return;
    }

    setIsUploading(true);

    try {
      const fileName = await convertFileToBase64(selectedFile);
      const response = await axiosInstance.post("/api/update-avatar", {
        fileName: fileName,
      });

      toast.success("Profile photo updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["user"] });

      setImagePreview(null);
      setSelectedFile(null);
      setCompressionInfo(null);

      const fileInput = document.getElementById(
        "avatarUpload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Upload failed";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel upload
  const cancelUpload = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setCompressionInfo(null);
    const fileInput = document.getElementById(
      "avatarUpload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      const response = await axiosInstance.put("/api/update-profile", editForm);
      toast.success("Profile updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    });
    setIsEditing(false);
  };

  // Get the current avatar URL
  const getCurrentAvatarUrl = () => {
    if (imagePreview) return imagePreview;
    if (user?.avatar?.url) return user.avatar.url;
    return null;
  };

  // Calculate user level based on points
  const getUserLevel = (points: number) => {
    if (points >= 10000)
      return { level: "Diamond", color: "text-blue-600", bg: "bg-blue-100" };
    if (points >= 5000)
      return { level: "Gold", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (points >= 1000)
      return { level: "Silver", color: "text-gray-600", bg: "bg-gray-100" };
    return { level: "Bronze", color: "text-orange-600", bg: "bg-orange-100" };
  };

  const userLevel = getUserLevel(user?.points || 0);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <main className="flex-grow px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Greeting */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Welcome back,{" "}
              <span className="text-blue-600">
                {isLoading ? (
                  <Loader2 className="inline animate-spin w-5 h-5" />
                ) : (
                  `${user?.name || "User"}`
                )}
              </span>
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Orders" count={totalOrders} Icon={Clock} />
            <StatCard
              title="Processed Orders"
              count={processedOrders}
              Icon={Truck}
            />
            <StatCard
              title="Completed Orders"
              count={completedOrders}
              Icon={CheckCircle}
            />
            <StatCard
              title="Points Earned"
              count={user?.points || 0}
              Icon={Star}
            />
          </div>

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6 relative">
            {/* Sidebar Toggle (Mobile) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm mb-3"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              Menu
            </button>

            {/* Sidebar */}
            <aside
              className={`bg-white rounded-md shadow-sm border border-gray-100 w-full lg:w-[250px] lg:static z-20 transition-all duration-300 fixed top-0 left-0 h-full lg:h-auto p-5 ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }`}
            >
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
                <X
                  className="text-gray-600 cursor-pointer"
                  onClick={() => setSidebarOpen(false)}
                />
              </div>

              <nav className="space-y-2">
                <NavItem
                  label="Profile"
                  Icon={User}
                  active={activeTab === "Profile"}
                  onclick={() => {
                    setActiveTab("Profile");
                    setSidebarOpen(false);
                  }}
                />
                <NavItem
                  label="My Orders"
                  Icon={ShoppingBag}
                  active={activeTab === "My Orders"}
                  onclick={() => {
                    setActiveTab("My Orders");
                    setSidebarOpen(false);
                  }}
                />
                <NavItem
                  label="Inbox"
                  Icon={Inbox}
                  onclick={() => router.push("/inbox")}
                />
                <NavItem
                  label="Notifications"
                  Icon={Bell}
                  active={activeTab === "Notifications"}
                  onclick={() => {
                    setActiveTab("Notifications");
                    setSidebarOpen(false);
                  }}
                />
                <NavItem
                  label="Shipping Address"
                  Icon={MapPin}
                  active={activeTab === "Shipping Address"}
                  onclick={() => {
                    setActiveTab("Shipping Address");
                    setSidebarOpen(false);
                  }}
                />
                <NavItem
                  label="Change Password"
                  Icon={Lock}
                  active={activeTab === "Change Password"}
                  onclick={() => {
                    setActiveTab("Change Password");
                    setSidebarOpen(false);
                  }}
                />
                <NavItem
                  label="Logout"
                  Icon={LogOut}
                  danger
                  onclick={logOutHandler}
                />
              </nav>
            </aside>

            {/* Main Content */}
            <section className="bg-white p-6 rounded-md shadow-sm border border-gray-100 w-full flex-1">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
                {activeTab}
              </h2>

              {activeTab === "Profile" && !isLoading && user ? (
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 shadow-lg">
                        {getCurrentAvatarUrl() ? (
                          <img
                            src={getCurrentAvatarUrl()!}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <User className="w-12 h-12" />
                          </div>
                        )}
                      </div>

                      {/* Upload Button */}
                      <button
                        onClick={() =>
                          document.getElementById("avatarUpload")?.click()
                        }
                        disabled={isUploading}
                        className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:opacity-50 shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                      </button>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        id="avatarUpload"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Compression Info */}
                    {compressionInfo && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                          {compressionInfo}
                        </p>
                      </div>
                    )}

                    {/* Upload Actions */}
                    {imagePreview && (
                      <div className="flex gap-3">
                        <button
                          onClick={handleAvatarUpload}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          {isUploading ? "Uploading..." : "Upload"}
                        </button>
                        <button
                          onClick={cancelUpload}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Upload Instructions */}
                    {!imagePreview && (
                      <div className="text-center max-w-xs">
                        <p className="text-sm text-gray-500 mb-2">
                          Click the camera icon to upload a new profile picture
                        </p>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>✅ Supports: JPEG, PNG, GIF, WebP</p>
                          <p>✅ Max size: 50MB (auto-compressed)</p>
                          <p>✅ Optimized for web display</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Level Badge */}
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${userLevel.bg} ${userLevel.color}`}
                    >
                      <Award className="w-4 h-4" />
                      <span className="font-semibold">
                        {userLevel.level} Member
                      </span>
                    </div>
                  </div>

                  {/* User Information */}
                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Profile Information
                      </h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  email: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Bio
                            </label>
                            <textarea
                              value={editForm.bio}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  bio: e.target.value,
                                })
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleProfileUpdate}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">
                            Full Name
                          </label>
                          <p className="text-gray-800">{user?.name}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">
                            Email Address
                          </label>
                          <p className="text-gray-800">{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">
                            Phone Number
                          </label>
                          <p className="text-gray-800">
                            {user?.phone || "Not provided"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">
                            Member Since
                          </label>
                          <p className="text-gray-800">
                            {new Date(user?.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">
                            Bio
                          </label>
                          <p className="text-gray-800">
                            {user?.bio || "No bio provided"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">
                            Account Status
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-600 font-medium">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Points and Balance Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Points Card */}
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Reward Points
                          </h3>
                          <p className="text-3xl font-bold">
                            {user?.points || 0}
                          </p>
                          <p className="text-sm opacity-90">Available points</p>
                        </div>
                        <Star className="w-12 h-12 opacity-80" />
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm">
                          <span>Next Level</span>
                          <span>
                            {userLevel.level === "Diamond"
                              ? "Max Level"
                              : "1000 points"}
                          </span>
                        </div>
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                          <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                ((user?.points || 0) % 1000) / 10,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Wallet Balance
                          </h3>
                          <p className="text-3xl font-bold">
                            ${user?.balance || 0}
                          </p>
                          <p className="text-sm opacity-90">
                            Available balance
                          </p>
                        </div>
                        <CreditCard className="w-12 h-12 opacity-80" />
                      </div>
                      <div className="mt-4">
                        <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200">
                          Add Funds
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {totalOrders}
                      </p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {completedOrders}
                      </p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {user?.points || 0}
                      </p>
                      <p className="text-sm text-gray-600">Points</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        ${user?.balance || 0}
                      </p>
                      <p className="text-sm text-gray-600">Balance</p>
                    </div>
                  </div>
                </div>
              ) : activeTab === "Shipping Address" ? (
                <ShippingAddressSection />
              ) : activeTab === "My Orders" ? (
                <OrderTable />
              ) : activeTab === "Change Password" ? (
                <ChangePassword />
              ) : activeTab === "Notifications" ? (
                <div>
                  {notifLoading ? (
                    <div className="text-gray-500">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-gray-500">No notifications</div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((n: any) => (
                        <div
                          key={n.id}
                          className={`py-3 ${n.status === 'Unread' ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-800">{n.title}</div>
                              <div className="text-sm text-gray-600">{n.message}</div>
                            </div>
                            <div className="text-xs text-gray-500 ml-4">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    This feature is under development
                  </p>
                </div>
              )}
            </section>

            {/* Quick Actions - RIGHT SIDE */}
            <section className="hidden lg:grid grid-cols-1 gap-4">
              <QuickActionCard
                Icon={Gift}
                title="Referral Program"
                description="Invite friends and earn rewards!"
              />
              <QuickActionCard
                Icon={BadgeCheck}
                title="Your Badges"
                description="View your earned badges and achievements."
              />
              <QuickActionCard
                Icon={Settings}
                title="Account Setting"
                description="Manage your preferences and settings."
              />
              <QuickActionCard
                Icon={Receipt}
                title="Billing History"
                description="Check your past invoices and payments."
              />
              <QuickActionCard
                Icon={PhoneCall}
                title="Support Center"
                description="Need help? Contact our support team."
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

// Navigation Item
const NavItem = ({ label, Icon, active, danger, onclick }: any) => (
  <button
    onClick={onclick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-blue-100 text-blue-600 border border-blue-200"
        : danger
        ? "text-red-500 hover:bg-red-50"
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);
