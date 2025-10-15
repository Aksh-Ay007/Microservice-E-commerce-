"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { Toaster } from "sonner";
import { WebSocketProvider } from "../context/web-socket-context";
import useUser from "../hooks/useUser";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWithWebSocket>{children}</ProviderWithWebSocket>
      <Toaster />
    </QueryClientProvider>
  );
};

const ProviderWithWebSocket = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();

  // ✅ Show children even while loading, just don't connect WebSocket yet
  // This prevents the unmount/remount cycle
  if (isLoading) {
    return <>{children}</>;
  }

  // ✅ Only wrap with WebSocket if user exists
  if (user) {
    return <WebSocketProvider user={user}>{children}</WebSocketProvider>;
  }

  // ✅ No user, render children directly
  return <>{children}</>;
};

export default Providers;
