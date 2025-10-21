"use client"

import { useAtom } from 'jotai'
import { activeSideBarItem, isMobileSidebarOpen } from '../configs/constants';

const useSidebar = () => {
   const [activeSideBar, setActiveSideBar] = useAtom(activeSideBarItem);
   const [mobileSidebarOpen, setMobileSidebarOpen] = useAtom(isMobileSidebarOpen);
  return { activeSideBar, setActiveSideBar, isMobileSidebarOpen: mobileSidebarOpen, setMobileSidebarOpen };
}

export default useSidebar
