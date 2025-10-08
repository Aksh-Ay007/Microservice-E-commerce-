"use client";

import { useQueryClient } from "@tanstack/react-query";
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
import useUser from "../../../hooks/useUser";
import QuickActionCard from "../../../shared/components/cards/quick-action.card";
import StatCard from "../../../shared/components/cards/stat.card";
import ShippingAddressSection from "../../../shared/components/shippingAddress";
import axiosInstance from "../../../utils/axiosinstance";

const ProfilePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user, isLoading } = useUser();
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

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <main className="flex-grow px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Greeting */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <StatCard
              title="Total Orders"
              count={user?.ordersCount || 0}
              Icon={Clock}
            />
            <StatCard
              title="Processed Orders"
              count={user?.processedOrdersCount || 0}
              Icon={Truck}
            />
            <StatCard
              title="Completed Orders"
              count={user?.completedOrdersCount || 0}
              Icon={CheckCircle}
            />
          </div>

          {/* Layout */}
          <div className="flex flex-col lg:flex-row gap-6 relative">
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
              className={`bg-white p-4 rounded-md shadow-sm border border-gray-100 w-full lg:w-1/5 absolute lg:static z-20 transition-all duration-300 ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }`}
            >
              <nav className="space-y-2">
                <NavItem
                  label="Profile"
                  Icon={User}
                  active={activeTab === "Profile"}
                  onclick={() => setActiveTab("Profile")}
                />
                <NavItem
                  label="My Orders"
                  Icon={ShoppingBag}
                  active={activeTab === "My Orders"}
                  onclick={() => setActiveTab("My Orders")}
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
                  onclick={() => setActiveTab("Notifications")}
                />
                <NavItem
                  label="Shipping Address"
                  Icon={MapPin}
                  active={activeTab === "Shipping Address"}
                  onclick={() => setActiveTab("Shipping Address")}
                />
                <NavItem
                  label="Change Password"
                  Icon={Lock}
                  active={activeTab === "Change Password"}
                  onclick={() => setActiveTab("Change Password")}
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
            <section className="bg-white p-6 rounded-md shadow-sm border border-gray-100 w-full lg:w-[55%]">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {activeTab}
              </h2>

              {activeTab === "Profile" && !isLoading && user ? (
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Image
                      src={
                        user?.avatar ||
                        "https://ik.imagekit.io/AkshayMicroMart/photo/3d-cartoon-portrait-person-practicing-law-related-profession%20(2).jpg?updatedAt=1759958440356"
                      }
                      alt="profile"
                      width={60}
                      height={60}
                      className="w-16 h-16 rounded-full border border-gray-200"
                    />
                    <button className="flex items-center gap-1 text-blue-500 text-xs font-medium hover:underline">
                      <Pencil className="w-4 h-4" />
                      Change Photo
                    </button>
                  </div>

                  <p>
                    <span className="font-semibold">Name:</span> {user?.name}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {user?.email}
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
              ) : activeTab === "Shipping Address" ? (
                <ShippingAddressSection />
              ) : (
                <></>
              )}
            </section>

            {/* Right Quick Panel */}
            <aside className="w-full lg:w-1/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
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
            </aside>
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
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
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
