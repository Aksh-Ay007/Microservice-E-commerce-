'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Trash2, Eye, EyeOff, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '../../../context/notification-context';

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

export default function NotificationsPage() {
  const { notifications: realTimeNotifications, markAsRead, markAllAsRead, deleteNotification, refreshNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: ''
  });

  // Use real-time notifications from context
  useEffect(() => {
    setNotifications(realTimeNotifications);
  }, [realTimeNotifications]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/seller/notifications/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    // Use real-time notifications, but also fetch stats
    refreshNotifications();
    fetchStats();
  }, [refreshNotifications]);

  // Use context methods for real-time updates
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    fetchStats(); // Refresh stats
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
    fetchStats(); // Refresh stats
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    fetchStats(); // Refresh stats
  };

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = !filters.status || notification.status === filters.status;
    const matchesType = !filters.type || notification.type === filters.type;
    const matchesPriority = !filters.priority || notification.priority === filters.priority;
    const matchesSearch = !filters.search || 
      notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      notification.message.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesType && matchesPriority && matchesSearch;
  });

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400">Manage and monitor your notifications</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1C1F29] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1C1F29] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <EyeOff className="w-8 h-8 text-orange-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-white">{stats.unread}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1C1F29] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Read</p>
                <p className="text-2xl font-bold text-white">{stats.total - stats.unread}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1C1F29] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Urgent</p>
                <p className="text-2xl font-bold text-white">{stats.byPriority.urgent || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#1C1F29] p-4 rounded-lg border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 bg-[#0F1117] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-[#0F1117] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
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
              className="w-full px-3 py-2 bg-[#0F1117] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
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
              className="w-full px-3 py-2 bg-[#0F1117] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
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
        <button
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Mark All as Read
        </button>
        <div className="text-sm text-gray-400">
          Showing {filteredNotifications.length} notifications
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-[#1C1F29] rounded-lg border border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-[#222633] transition-colors ${
                  notification.status === 'Unread' ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
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
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
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
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
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