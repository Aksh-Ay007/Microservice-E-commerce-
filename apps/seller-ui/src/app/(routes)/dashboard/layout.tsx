"use client";
import React, { useEffect } from 'react'
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import { Toaster } from "react-hot-toast";
import { Menu, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { isSidebarOpenAtom } from '../../../configs/constants';
import { usePathname } from 'next/navigation';


const Layout = ({children}:{children:React.ReactNode}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(isSidebarOpenAtom);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, setIsSidebarOpen]);

  return (
    <div className="flex h-full bg-[#0F1117] min-h-screen">
      {/* Sidebar */}
      <aside
        className={
          `relative md:relative z-50 text-white p-4 border-r border-r-slate-800 bg-[#0F1117]
           fixed md:static top-0 left-0 h-full w-72 transform transition-transform duration-300
           ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`
        }
      >
        {/* Close button on mobile */}
        <button
          aria-label="Close menu"
          className="md:hidden absolute top-3 right-3 p-2 rounded hover:bg-slate-800"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="sticky top-0">
          <SideBarWrapper />
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          aria-hidden
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* main content area */}
      <main className="flex-1">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 px-4 py-3 bg-[#0F1117] border-b border-slate-800 flex items-center gap-3">
          <button
            aria-label="Open menu"
            className="p-2 rounded hover:bg-slate-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="text-sm text-slate-300">Menu</span>
        </div>

        <div className="overflow-auto">
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </main>
    </div>
  );
}

export default Layout;
