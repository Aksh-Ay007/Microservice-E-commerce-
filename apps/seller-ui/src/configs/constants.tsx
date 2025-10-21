"use client";
import { atom } from "jotai";



export const activeSideBarItem = atom<string>("/dashboard");

// Controls mobile sidebar visibility in seller dashboard
export const isSidebarOpenAtom = atom<boolean>(false);
