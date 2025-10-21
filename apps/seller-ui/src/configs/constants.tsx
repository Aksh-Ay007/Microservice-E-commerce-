"use client";
import { atom } from "jotai";

export const activeSideBarItem = atom<string>("/dashboard");
export const isMobileSidebarOpen = atom<boolean>(false);
