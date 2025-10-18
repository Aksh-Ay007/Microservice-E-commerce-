'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Trash2, Eye, EyeOff, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../../../utils/axiosinstance';

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

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: ''
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/seller/seller-notifications');
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      // Calculate stats from notifications
      const total = notifications.length;
      const unread = notifications.filter(n => n.status === 'Unread').length;
      
      const byType = notifications.reduce((acc, notif) => {
        acc[notif.type] = (acc[notif.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const byPriority = notifications.reduce((acc, notif) => {
        acc[notif.priority] = (acc[notif.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({ total, unread, byType, byPriority });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      fetchStats();
    }
  }, [notifications]);

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      // Update local state immediately for better UX
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, status: 'Read' } : notif
        )
      );
      
      // Here you would typically call an API to mark as read
      // await axiosInstance.put(`/seller/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      // Here you would typically call an API to delete
      // await axiosInstance.delete(`/seller/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <CheckCircle className="w-4 h-4" />;
      case 'product': return <Info className="w-4 h-4" />;
      case 'system': return <AlertCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filters.status && notification.status !== filters.status) return false;
    if (filters.type && notification.type !== filters.type) return false;
    if (filters.priority && notification.priority !== filters.priority) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return notification.title.toLowerCase().includes(searchTerm) ||
             notification.message.toLowerCase().includes(searchTerm);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Stay updated with your shop activities</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <EyeOff className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total - stats.unread}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byPriority.urgent || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="order">Order</option>
              <option value="product">Product</option>
              <option value="system">System</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  notification.status === 'Unread' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(notification.type)}
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {notification.status === 'Unread' && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>By: {notification.creator.name} ({notification.creator.role})</span>
                      <span>•</span>
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {notification.status === 'Unread' && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}