"use client";

import React, { useState } from 'react'
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import { Toaster } from "react-hot-toast";
import { Menu, X } from "lucide-react";

const Layout = ({children}:{children:React.ReactNode}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full bg-[#0F1117] min-h-screen">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-[280px] min-w-[280px] border-r border-r-slate-800 text-white p-4
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isMobileMenuOpen 
          ? 'fixed top-0 left-0 h-full z-50 translate-x-0' 
          : 'fixed top-0 left-0 h-full z-50 -translate-x-full'
        }
      `}>
        <div className="sticky top-0 h-full overflow-y-auto">
          <SideBarWrapper onMobileMenuClose={() => setIsMobileMenuOpen(false)} />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 lg:ml-0">
        <div className="overflow-auto h-full">
          {/* Mobile header */}
          <div className="lg:hidden bg-slate-800 text-white p-4 mb-4">
            <h1 className="text-lg font-semibold">Seller Dashboard</h1>
          </div>
          
          <div className="p-4 lg:p-6">
            {children}
          </div>
          
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </main>
    </div>
  );
}

export default Layout;
