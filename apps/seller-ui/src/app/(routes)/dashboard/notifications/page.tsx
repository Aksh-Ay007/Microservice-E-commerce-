'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Trash2, Eye, EyeOff, AlertCircle, Info, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../../utils/axiosinstance';
import useSeller from '../../../../hooks/useSeller';
import toast from 'react-hot-toast';

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
  const { seller } = useSeller();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ['seller-notifications', seller?.id, pagination.page, filters],
    queryFn: async () => {
      if (!seller?.id) return { notifications: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await axiosInstance.get(`/seller/api/seller-notifications?${params}`);
      return response.data;
    },
    enabled: !!seller?.id,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['seller-notification-stats', seller?.id],
    queryFn: async () => {
      if (!seller?.id) return null;
      
      const response = await axiosInstance.get('/seller/api/seller-notifications/stats');
      return response.data;
    },
    enabled: !!seller?.id,
  });

  const notifications = notificationsData?.notifications || [];
  const paginationData = notificationsData?.pagination || pagination;

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      await axiosInstance.put(`/seller/api/seller-notifications/${id}/read`);
      
      // Update cache
      queryClient.setQueryData(
        ['seller-notifications', seller?.id, pagination.page, filters],
        (old: any) => ({
          ...old,
          notifications: old?.notifications?.map((notif: Notification) =>
            notif.id === id ? { ...notif, status: 'Read' } : notif
          ) || []
        })
      );
      
      // Refetch stats
      queryClient.invalidateQueries({ queryKey: ['seller-notification-stats'] });
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      await axiosInstance.delete(`/seller/api/seller-notifications/${id}`);
      
      // Update cache
      queryClient.setQueryData(
        ['seller-notifications', seller?.id, pagination.page, filters],
        (old: any) => ({
          ...old,
          notifications: old?.notifications?.filter((notif: Notification) => notif.id !== id) || []
        })
      );
      
      // Refetch stats
      queryClient.invalidateQueries({ queryKey: ['seller-notification-stats'] });
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/seller/api/seller-notifications/mark-all-read', {
        receiverId: seller?.id
      });
      
      // Update cache
      queryClient.setQueryData(
        ['seller-notifications', seller?.id, pagination.page, filters],
        (old: any) => ({
          ...old,
          notifications: old?.notifications?.map((notif: Notification) => ({ ...notif, status: 'Read' })) || []
        })
      );
      
      // Refetch stats
      queryClient.invalidateQueries({ queryKey: ['seller-notification-stats'] });
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all notifications as read');
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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400">Manage your notifications and stay updated</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
            <div className="flex items-center">
              <EyeOff className="w-8 h-8 text-orange-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-white">{stats.unread}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Read</p>
                <p className="text-2xl font-bold text-white">{stats.total - stats.unread}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Urgent</p>
                <p className="text-2xl font-bold text-white">{stats.byPriority?.urgent || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg shadow mb-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="">All Status</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="">All Types</option>
              <option value="order">Order</option>
              <option value="product">Product</option>
              <option value="system">System</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
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

      {/* Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Mark All as Read
          </button>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="text-sm text-gray-400">
          Showing {notifications.length} of {paginationData.total} notifications
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-750 transition-colors ${
                  notification.status === 'Unread' ? 'bg-gray-750 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(notification.type)}
                      <h3 className="font-medium text-white">{notification.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {notification.status === 'Unread' && (
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
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
                        className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
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

      {/* Pagination */}
      {paginationData.pages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: paginationData.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-md text-sm ${
                  page === paginationData.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}