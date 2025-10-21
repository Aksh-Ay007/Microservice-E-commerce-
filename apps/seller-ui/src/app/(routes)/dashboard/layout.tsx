'use client';

import React, { useState } from 'react'
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import { Toaster } from "react-hot-toast";
import { Menu, X } from 'lucide-react';

const Layout = ({children}:{children:React.ReactNode}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-[#0F1117] min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] lg:w-[280px] lg:min-w-[280px]
        border-r border-r-slate-800 bg-[#0F1117] text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="sticky top-0 h-screen overflow-y-auto">
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X size={24} />
          </button>
          <SideBarWrapper />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 w-full lg:w-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#0F1117] border-b border-slate-800 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-gray-300"
          >
            <Menu size={24} />
          </button>
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
