"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

interface WebSocketContextType {
  ws: WebSocket | null;
  unreadCounts: Record<string, number>;
  wsReady: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) => {
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.id) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected for user:", user.id);
      ws.send(`user_${user.id}`);
      setWsReady(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload;
        setUnreadCounts((prev) => ({
          ...prev,
          [conversationId]: count,
        }));
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setWsReady(false);
    };

    return () => {
      console.log("🧹 Cleaning up WebSocket");
      ws.close();
      setWsReady(false);
    };
  }, [user?.id]);

  // ✅ Always render children, even if WebSocket isn't ready yet
  // This prevents unmounting/remounting cycle
  return (
    <WebSocketContext.Provider
      value={{
        ws: wsRef.current,
        unreadCounts,
        wsReady
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);

  // ✅ Return null safely if not within provider (e.g., user not logged in)
  // This allows components to gracefully handle missing WebSocket
  if (!context) {
    return {
      ws: null,
      unreadCounts: {},
      wsReady: false,
    };
  }

  return context;
};
