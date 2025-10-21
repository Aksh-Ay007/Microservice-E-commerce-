"use client";

import React, { useState } from 'react'
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import { Toaster } from "react-hot-toast";
import { Menu, X } from "lucide-react";


const Layout = ({children}:{children:React.ReactNode}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-[#0F1117] min-h-screen">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-[#0F1117] border-b border-slate-800 z-50 flex items-center justify-between px-4">
        <button
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-slate-800 text-white"
        >
          <Menu size={20} />
        </button>
        <div className="text-sm font-medium text-white">Seller Dashboard</div>
        <span className="w-8" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-[280px] min-w-[280px] border-r border-r-slate-800 text-white p-4">
        <div className="sticky top-0">
          <SideBarWrapper />
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] bg-[#0F1117] border-r border-slate-800 md:hidden p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-medium">Menu</div>
              <button
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-slate-800 text-white"
              >
                <X size={18} />
              </button>
            </div>
            <SideBarWrapper />
          </div>
        </>
      )}

      {/* Main content area */}
      <main className="flex-1 pt-14 md:pt-0">
        <div className="overflow-auto p-4 md:p-6">
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </main>
    </div>
  );
}

export default Layout;
