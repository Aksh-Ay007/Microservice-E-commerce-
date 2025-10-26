"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BadgeCheck,
  Bell,
  Camera,
  CheckCircle,
  Clock,
  Gift,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Menu,
  PhoneCall,
  Receipt,
  Settings,
  ShoppingBag,
  Star,
  Truck,
  Upload,
  User,
  X,
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

const ProfilePage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const logOutHandler = async () => {
    await axiosInstance.get("/api/logout-user").then(() => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/login");
    });
  };

  // Smart image compression function
  const compressImage = (
    file: File,
    maxWidth: number = 400,
    quality: number = 0.85
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image();

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

  // Get the current avatar URL
  const getCurrentAvatarUrl = () => {
    if (imagePreview) return imagePreview;
    if (user?.avatar?.url) return user.avatar.url;
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-5">
            {/* Sidebar Toggle (Mobile) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              <span className="font-medium">Menu</span>
            </button>

            {/* Sidebar */}
            <aside
              className={`bg-white rounded-lg shadow-sm border border-gray-100 w-full lg:w-[260px] lg:static z-20 transition-all duration-300 fixed top-0 left-0 h-full lg:h-auto ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-5 lg:hidden">
                  <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
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
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <NavItem
                      label="Logout"
                      Icon={LogOut}
                      danger
                      onclick={logOutHandler}
                    />
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-5 pb-4 border-b border-gray-100">
                {activeTab}
              </h2>

              {activeTab === "Profile" && !isLoading && user ? (
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="flex flex-col items-center space-y-4 py-4">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 shadow-lg ring-4 ring-gray-50">
                        {getCurrentAvatarUrl() ? (
                          <img
                            src={getCurrentAvatarUrl()!}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                        className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-2.5 hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
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
                      <div className="w-full max-w-md">
                        <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg text-center border border-gray-200">
                          {compressionInfo}
                        </p>
                      </div>
                    )}

                    {/* Upload Actions */}
                    {imagePreview && (
                      <div className="flex gap-2.5">
                        <button
                          onClick={handleAvatarUpload}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                        >
                          <Upload className="w-4 h-4" />
                          {isUploading ? "Uploading..." : "Upload"}
                        </button>
                        <button
                          onClick={cancelUpload}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors font-medium"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Upload Instructions */}
                    {!imagePreview && (
                      <div className="text-center max-w-xs">
                        <p className="text-xs text-gray-500">
                          Click the camera icon to upload a new profile picture
                        </p>
                      </div>
                    )}
                  </div>

                  {/* User Information */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                      Profile Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Full Name
                        </label>
                        <p className="text-sm text-gray-800 font-medium">
                          {user?.name}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Email Address
                        </label>
                        <p className="text-sm text-gray-800 font-medium">
                          {user?.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Phone Number
                        </label>
                        <p className="text-sm text-gray-800 font-medium">
                          {user?.phone || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Member Since
                        </label>
                        <p className="text-sm text-gray-800 font-medium">
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
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Bio
                        </label>
                        <p className="text-sm text-gray-800 font-medium">
                          {user?.bio || "No bio provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Account Status
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-semibold">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800 text-center">
                        {totalOrders}
                      </p>
                      <p className="text-xs text-gray-600 text-center mt-1">
                        Total Orders
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="w-11 h-11 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800 text-center">
                        {completedOrders}
                      </p>
                      <p className="text-xs text-gray-600 text-center mt-1">
                        Completed
                      </p>
                    </div>
                  </div>
                </div>
              ) : activeTab === "Shipping Address" ? (
                <ShippingAddressSection />
              ) : activeTab === "My Orders" ? (
                <OrderTable />
              ) : activeTab === "Change Password" ? (
                <ChangePassword />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-sm text-gray-500">
                    This feature is under development
                  </p>
                </div>
              )}
            </section>

            {/* Quick Actions - RIGHT SIDE */}
            <section className="hidden lg:grid grid-cols-1 gap-3.5 content-start">
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
    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-blue-50 text-blue-600 shadow-sm"
        : danger
        ? "text-red-600 hover:bg-red-50"
        : "text-gray-700 hover:bg-gray-50"
    }`}
  >
    <Icon className="w-[18px] h-[18px]" />
    <span>{label}</span>
  </button>
);
