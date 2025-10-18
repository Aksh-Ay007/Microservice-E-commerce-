'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  title: string;
  message: string;
  status: 'Read' | 'Unread';
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
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:6009', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification service');
      setIsConnected(true);
      
      // Join as seller (you might want to get this from auth context)
      const sellerId = localStorage.getItem('sellerId') || 'seller';
      newSocket.emit('join', { userId: sellerId, role: 'seller' });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification service');
      setIsConnected(false);
    });

    newSocket.on('newNotification', (notification: Notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('notifications', (data: { notifications: Notification[] }) => {
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter(n => n.status === 'Unread').length);
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      newSocket.close();
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (notification.status === 'Unread') {
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/seller/notifications/${id}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, status: 'Read' } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/seller/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: 'all' }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, status: 'Read' }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/seller/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        // Don't update unread count here as we don't know if it was unread
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const refreshNotifications = () => {
    if (socketRef.current) {
      const sellerId = localStorage.getItem('sellerId') || 'seller';
      socketRef.current.emit('getNotifications', { userId: sellerId, role: 'seller' });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        isConnected,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};