import React from 'react'
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import { Toaster } from "react-hot-toast";


const Layout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="flex h-full bg-[#0F1117] min-h-screen">
      {/*Sidebar */}

      <aside className="w-[280px] min-w-[300px] border-r border-r-slate-800 text-white p-4">
        <div className="sticky top-0">
          <SideBarWrapper />
        </div>
      </aside>

      {/*main content area */}

      <main className="flex-1">
        <div className="overflow-auto">
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </main>
    </div>
  );
}

export default Layout;
