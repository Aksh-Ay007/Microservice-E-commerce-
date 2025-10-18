"use client";

import {
  BellPlus,
  BellRing,
  CalendarPlus,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Home from "../../../assets/icons/home";
import Payment from "../../../assets/icons/payment";
import Logo from "../../../assets/svgs/logo";
import useSeller from "../../../hooks/useSeller";
import useSidebar from "../../../hooks/useSidebar";
import { useNotifications } from "../../../context/notification-context";
import Box from "../box";
import SidebarItem from "./sidebar.item";
import SidebarMenu from "./sidebar.menu";
import { Sidebar } from "./sidebar.styles";

const SideBarWrapper = () => {
  const { activeSideBar, setActiveSideBar } = useSidebar();
  const { unreadCount } = useNotifications();

  const pathName = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSideBar(pathName);
  }, [pathName, setActiveSideBar]);

  const getIconColor = (route: string) =>
    activeSideBar === route ? "#0085ff" : "#969696";

  return (
    <Box
      $css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <Logo size={50} fill="#0085ff" />

            <Box>
              <h3 className=" text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<Home fill={getIconColor("dashboard")} />}
            isActive={activeSideBar === "/dashboard"}
            href="/dashboard"
          />

          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Profile"
                icon={
                  <UserCircle
                    size={26}
                    color={getIconColor("/dashboard/profile")}
                  />
                }
                isActive={activeSideBar === "/dashboard/profile"}
                href="/dashboard/profile"
              />
              <SidebarItem
                title="Orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
                isActive={activeSideBar === "/dashboard/orders"}
                href="/dashboard/orders"
              />

              <SidebarItem
                title="Payments"
                icon={<Payment fill={getIconColor("/dashboard/payments")} />}
                isActive={activeSideBar === "/dashboard/payments"}
                href="/dashboard/payments"
              />
            </SidebarMenu>

            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Product"
                icon={
                  <SquarePlus
                    size={24}
                    color={getIconColor("/dashboard/create-product")}
                  />
                }
                isActive={activeSideBar === "/dashboard/create-product"}
                href="/dashboard/create-product"
              />

              <SidebarItem
                title="All Products"
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
                isActive={activeSideBar === "/dashboard/all-products"}
                href="/dashboard/all-products"
              />
            </SidebarMenu>

            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                icon={
                  <CalendarPlus
                    size={24}
                    color={getIconColor("/dashboard/create-event")}
                  />
                }
                isActive={activeSideBar === "/dashboard/create-event"}
                href="/dashboard/create-event"
              />

              <SidebarItem
                title="All Events"
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
                isActive={activeSideBar === "/dashboard/all-events"}
                href="/dashboard/all-events"
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                icon={
                  <Mail size={20} color={getIconColor("/dashboard/inbox")} />
                }
                isActive={activeSideBar === "/dashboard/inbox"}
                href="/dashboard/inbox"
              />

              <SidebarItem
                title="Settings"
                icon={
                  <Settings
                    size={22}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
                isActive={activeSideBar === "/dashboard/settings"}
                href="/dashboard/settings"
              />

              <SidebarItem
                title="Notifications"
                icon={
                  <div className="relative">
                    <BellRing
                      size={24}
                      color={getIconColor("/dashboard/notifications")}
                    />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                }
                isActive={activeSideBar === "/dashboard/notifications"}
                href="/dashboard/notifications"
              />
            </SidebarMenu>

            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                icon={
                  <TicketPercent
                    size={22}
                    color={getIconColor("/dashboard/discount-codes")}
                  />
                }
                isActive={activeSideBar === "/dashboard/discount-codes"}
                href="/dashboard/discount-codes"
              />

              <SidebarItem
                title="Logout"
                icon={<LogOut size={20} color={getIconColor("/logout")} />}
                isActive={activeSideBar === "/logout"}
                href="/logout"
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SideBarWrapper;
