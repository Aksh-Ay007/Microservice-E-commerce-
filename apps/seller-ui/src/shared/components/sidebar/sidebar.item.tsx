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
    <Link href={href} className="my-1 block">
      <div
        className={`flex gap-3 w-full min-h-12 h-full items-center px-3 py-2 rounded-lg cursor-pointer transition
    hover:bg-[#2b2f31]
    ${
      isActive
        ? "scale-[.98] bg-[#0f3158] fill-blue-200 hover:!bg-[#0f3158d6]"
        : ""
    }`}
      >
        <span className="shrink-0">{icon}</span>
        <h5 className="text-slate-200 text-sm md:text-base truncate">{title}</h5>
      </div>
    </Link>
  );
};

export default SidebarItem;
