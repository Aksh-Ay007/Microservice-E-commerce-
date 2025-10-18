'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSeller } from '../hooks/useSeller';

interface Notification {
  id: string;
  receiverId: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'system' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  redirect_link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { seller } = useSeller();

  useEffect(() => {
    if (!seller?.id) return;

    // Connect to WebSocket
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications/${seller.id}`;
      
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('Connected to notification WebSocket');
        setIsConnected(true);
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            addNotification(data.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('Disconnected from notification WebSocket');
        setIsConnected(false);
        setWs(null);
        
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [seller?.id]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, status: 'Read' as any } : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => n.status === 'Unread').length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearNotifications,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};