import Link from "next/link";
import React from "react";

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  href: string;
}

const SidebarItem = ({ icon, title, isActive, href }: Props) => {
  return (
    <Link href={href} className="my-2 block">
      <div
        className={`flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg cursor-pointer transition-all duration-200
    hover:bg-[#2b2f31]
    ${
      isActive
        ? "scale-[.98] bg-[#0f3158] fill-blue-200 hover:!bg-[#0f3158d6]"
        : ""
    }`}
      >
        <div className="flex-shrink-0">
          {icon}
        </div>
        <h5 className="text-slate-200 text-sm lg:text-lg truncate">{title}</h5>
      </div>
    </Link>
  );
};

export default SidebarItem;
