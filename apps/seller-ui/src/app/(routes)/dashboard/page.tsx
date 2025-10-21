"use client";

import React from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  TrendingUp,
  Package,
  Calendar,
  MessageSquare,
  Star
} from 'lucide-react';

const Dashboard = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    { title: 'Total Sales', value: '$12,345', icon: DollarSign, change: '+12%', color: 'text-green-400' },
    { title: 'Products', value: '156', icon: Package, change: '+3', color: 'text-blue-400' },
    { title: 'Orders', value: '89', icon: ShoppingBag, change: '+8%', color: 'text-purple-400' },
    { title: 'Customers', value: '1,234', icon: Users, change: '+15%', color: 'text-orange-400' },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', amount: '$125.00', status: 'Completed' },
    { id: '#ORD-002', customer: 'Jane Smith', amount: '$89.50', status: 'Processing' },
    { id: '#ORD-003', customer: 'Mike Johnson', amount: '$234.75', status: 'Shipped' },
  ];

  return (
    <div className="min-h-screen bg-[#0F1117] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-800 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className={`text-sm font-medium ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Orders */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm">View all</button>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{order.id}</p>
                    <p className="text-gray-400 text-sm">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{order.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'Completed' ? 'bg-green-600/20 text-green-400' :
                      order.status === 'Processing' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-blue-600/20 text-blue-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Package className="text-blue-400 mb-2" size={24} />
                <span className="text-white text-sm font-medium">Add Product</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Calendar className="text-green-400 mb-2" size={24} />
                <span className="text-white text-sm font-medium">Create Event</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <MessageSquare className="text-purple-400 mb-2" size={24} />
                <span className="text-white text-sm font-medium">Messages</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <TrendingUp className="text-orange-400 mb-2" size={24} />
                <span className="text-white text-sm font-medium">Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Sales Performance</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
            <div className="text-center">
              <TrendingUp className="text-gray-600 mx-auto mb-2" size={48} />
              <p className="text-gray-400">Chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
