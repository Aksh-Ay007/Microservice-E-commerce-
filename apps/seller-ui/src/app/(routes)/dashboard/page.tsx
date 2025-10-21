"use client";

import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Eye,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const DashboardPage = () => {
  // Mock data - replace with actual data from your API
  const stats = [
    {
      title: 'Total Products',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Orders',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-green-500'
    },
    {
      title: 'Revenue',
      value: '$12,345',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Active Events',
      value: '3',
      change: '+2',
      changeType: 'positive',
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'New order #12345 received',
      time: '2 minutes ago',
      icon: ShoppingCart,
      color: 'text-green-400'
    },
    {
      id: 2,
      type: 'product',
      message: 'Product "Wireless Headphones" updated',
      time: '1 hour ago',
      icon: Package,
      color: 'text-blue-400'
    },
    {
      id: 3,
      type: 'event',
      message: 'Event "Black Friday Sale" created',
      time: '3 hours ago',
      icon: Calendar,
      color: 'text-orange-400'
    },
    {
      id: 4,
      type: 'payment',
      message: 'Payment of $234.50 received',
      time: '5 hours ago',
      icon: DollarSign,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/create-product"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Product</span>
          </Link>
          <Link
            href="/dashboard/create-event"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Calendar size={16} />
            <span className="hidden sm:inline">Create Event</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#1C1F29] rounded-lg p-4 lg:p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-[#1C1F29] rounded-lg p-4 lg:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Activities</h2>
            <Link href="/dashboard/notifications" className="text-blue-400 hover:text-blue-300 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#2A2D3A] transition-colors">
                  <div className={`p-2 rounded-lg bg-gray-800`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1C1F29] rounded-lg p-4 lg:p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/create-product"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2A2D3A] transition-colors group"
            >
              <div className="p-2 rounded-lg bg-blue-600 group-hover:bg-blue-700">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Add New Product</p>
                <p className="text-gray-400 text-xs">Create a new product listing</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/create-event"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2A2D3A] transition-colors group"
            >
              <div className="p-2 rounded-lg bg-orange-600 group-hover:bg-orange-700">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Create Event</p>
                <p className="text-gray-400 text-xs">Set up a flash sale or event</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2A2D3A] transition-colors group"
            >
              <div className="p-2 rounded-lg bg-green-600 group-hover:bg-green-700">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">View Orders</p>
                <p className="text-gray-400 text-xs">Manage customer orders</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/all-products"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2A2D3A] transition-colors group"
            >
              <div className="p-2 rounded-lg bg-purple-600 group-hover:bg-purple-700">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Manage Products</p>
                <p className="text-gray-400 text-xs">Edit or delete products</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-[#1C1F29] rounded-lg p-4 lg:p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">+23%</div>
            <div className="text-gray-400 text-sm">Sales Growth</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">4.8</div>
            <div className="text-gray-400 text-sm">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">89%</div>
            <div className="text-gray-400 text-sm">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
