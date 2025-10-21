'use client';

import React from 'react'
import Link from 'next/link'
import { 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Package,
  Users,
  Eye
} from 'lucide-react'

const DashboardPage = () => {
  return (
    <div className="w-full min-h-screen px-4 md:px-6 lg:px-8 py-6 md:py-8 bg-[#0F1117]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's an overview of your shop.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-[#1C1F29] p-4 md:p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Orders</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">--</p>
          </div>

          <div className="bg-[#1C1F29] p-4 md:p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Revenue</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">$--</p>
          </div>

          <div className="bg-[#1C1F29] p-4 md:p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
                <Package className="w-6 h-6 text-purple-400" />
              </div>
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Products</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">--</p>
          </div>

          <div className="bg-[#1C1F29] p-4 md:p-6 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Active Events</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">--</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/create-product"
              className="bg-[#1C1F29] p-4 md:p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all hover:scale-105 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Add Product</h3>
                  <p className="text-gray-400 text-sm">Create new product</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/create-event"
              className="bg-[#1C1F29] p-4 md:p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-all hover:scale-105 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-colors">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Create Event</h3>
                  <p className="text-gray-400 text-sm">Add new event</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/orders"
              className="bg-[#1C1F29] p-4 md:p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-all hover:scale-105 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-colors">
                  <ShoppingCart className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">View Orders</h3>
                  <p className="text-gray-400 text-sm">Manage orders</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/profile"
              className="bg-[#1C1F29] p-4 md:p-6 rounded-lg border border-gray-700 hover:border-orange-500 transition-all hover:scale-105 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-colors">
                  <Users className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Edit Profile</h3>
                  <p className="text-gray-400 text-sm">Update shop info</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-[#1C1F29] border border-gray-700 rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Getting Started</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <div>
                <h4 className="text-white font-medium">Complete your profile</h4>
                <p className="text-gray-400 text-sm">Add shop information, avatar, and banner</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <div>
                <h4 className="text-white font-medium">Add your first product</h4>
                <p className="text-gray-400 text-sm">Start selling by creating your product listings</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <div>
                <h4 className="text-white font-medium">Create discount codes</h4>
                <p className="text-gray-400 text-sm">Attract customers with special offers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
