"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bell,
  CheckCircle,
  Clock,
  Gift,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Pencil,
  PhoneCall,
  Receipt,
  Settings,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      console.log("Uploading image:", base64String.slice(0, 50));

      try {
        await axiosInstance.post(
          "/api/update-avatar",
          {
            fileName: base64String,
          }
        );
        toast.success("Profile photo updated!");
        queryClient.invalidateQueries({ queryKey: ["user"] });
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                {activeTab}
              </h2>

              {activeTab === "Profile" && !isLoading && user ? (
                <div className="space-y-4 text-sm md:text-base text-gray-700">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Image
                      src={
                        user?.avatar ||
                        "https://ik.imagekit.io/AkshayMicroMart/photo/useravatar.jpg?updatedAt=1760470134415"
                      }
                      alt="profile"
                      width={60}
                      height={60}
                      className="w-16 h-16 rounded-full border border-gray-200"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="avatarUpload"
                      onChange={handleAvatarUpload}
                    />
                    <button
                      onClick={() =>
                        document.getElementById("avatarUpload")?.click()
                      }
                      className="flex items-center gap-1 text-blue-500 text-xs font-medium hover:underline"
                    >
                      <Pencil className="w-4 h-4" />
                      Change Photo
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Name:</span> {user?.name}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {user?.email}
                    </p>
                    <p>
                      <span className="font-semibold">Joined:</span>{" "}
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-semibold">Earned Points:</span>{" "}
                      {user?.points || 0}
                    </p>
                  </div>
                </div>
              ) : activeTab === "Shipping Address" ? (
                <ShippingAddressSection />
              ) : activeTab === "My Orders" ? (
                <OrderTable />
              ) : activeTab === "Change Password" ? (
                <ChangePassword />
              ) : (
                <p className="text-sm text-gray-500">Coming soon...</p>
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
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
      active
        ? "bg-blue-100 text-blue-600"
        : danger
        ? "text-red-500 hover:bg-red-50"
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);
