'use client';

import React, { useState } from 'react'
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import { Toaster } from "react-hot-toast";
import { Menu, X } from 'lucide-react';

const Layout = ({children}:{children:React.ReactNode}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-[#0F1117] min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] lg:w-[280px] xl:w-[300px]
        border-r border-r-slate-800 text-white p-4
        bg-[#0F1117] transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-white hover:bg-gray-800 rounded-lg"
        >
          <X size={20} />
        </button>
        
        <div className="sticky top-0">
          <SideBarWrapper />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#0F1117] border-b border-slate-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white hover:bg-gray-800 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-white">MicroMart Seller</h1>
          <div className="w-10" /> {/* Spacer for centering */}
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
