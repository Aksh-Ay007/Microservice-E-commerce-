"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { WebSocketProvider } from "../context/web-socket-context";
import useSeller from "../hooks/useSeller";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWithWebSocket>{children}</ProviderWithWebSocket>
    </QueryClientProvider>
  );
};

const ProviderWithWebSocket = ({ children }: { children: React.ReactNode }) => {
  const { seller, isLoading } = useSeller();

  if (isLoading) {
    return <>{children}</>;
  }

  if (seller) {
    return <WebSocketProvider seller={seller}>{children}</WebSocketProvider>;
  }

  return <>{children}</>;
};

export default Providers;
