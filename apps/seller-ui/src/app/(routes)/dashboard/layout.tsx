"use client";

import React from 'react'
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import { Toaster } from "react-hot-toast";
import { Menu } from 'lucide-react';
import useSidebar from '../../../hooks/useSidebar';

const Layout = ({children}:{children:React.ReactNode}) => {
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useSidebar();

  return (
    <div className="flex h-full bg-[#0F1117] min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-r-slate-800 text-white p-4 bg-[#0F1117]
      `}>
        <div className="sticky top-0 h-full">
          <SideBarWrapper onClose={() => setMobileSidebarOpen(false)} />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-[#0F1117] border-b border-slate-800 p-4 flex items-center justify-between">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-white font-semibold text-lg">Seller Dashboard</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        <div className="overflow-auto">
          {children as React.ReactNode}
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </main>
    </div>
  );
}

export default Layout;
