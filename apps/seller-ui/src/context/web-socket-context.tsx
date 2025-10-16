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
  seller,
}: {
  children: React.ReactNode;
  seller: any;
}) => {
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!seller?.id) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected for seller:", seller.id);
      ws.send(`seller_${seller.id}`);
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
  }, [seller?.id]);

  return (
    <WebSocketContext.Provider
      value={{
        ws: wsRef.current,
        unreadCounts,
        wsReady,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);

  if (!context) {
    return {
      ws: null,
      unreadCounts: {},
      wsReady: false,
    };
  }

  return context;
};
