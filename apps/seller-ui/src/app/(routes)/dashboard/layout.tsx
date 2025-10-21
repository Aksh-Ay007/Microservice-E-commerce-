"use client";

import React, { useState } from 'react'
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import { Toaster } from "react-hot-toast";
import { Menu, X } from "lucide-react";


const Layout = ({children}:{children:React.ReactNode}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-[#0F1117] min-h-screen">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/*Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-[280px] lg:w-[280px] lg:min-w-[300px]
          border-r border-r-slate-800 text-white p-4
          bg-[#0F1117]
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="sticky top-0">
          <SideBarWrapper />
        </div>
      </aside>

      {/*main content area */}
      <main className="flex-1 w-full lg:w-auto overflow-x-hidden">
        <div className="overflow-auto pt-16 lg:pt-0">
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </main>
    </div>
  );
}

export default Layout;
