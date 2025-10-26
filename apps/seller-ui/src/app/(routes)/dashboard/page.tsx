"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
} from "lucide-react";
import axiosInstance from '../../../utils/axiosinstance';

const COLORS = ["#4ade80", "#facc15", "#60a5fa", "#f87171", "#a78bfa"];

const columns = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ getValue }: any) => {
      const value = getValue() as string;
      return value.substring(0, 8) + "...";
    },
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ getValue }: any) => {
      return `$${parseFloat(getValue()).toFixed(2)}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }: any) => {
      const value = getValue();
      const color =
        value === "Paid" || value === "Delivered"
          ? "text-green-400"
          : value === "Pending" || value === "Cash on Delivery"
          ? "text-yellow-400"
          : "text-red-400";
      return <span className={`font-medium ${color}`}>{value}</span>;
    },
  },
];

const OrdersTable = ({ orders }: { orders: any[] }) => {
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-6">
      <h2 className="text-white text-xl font-semibold mb-4">Recent Orders</h2>
      <span className="block text-sm text-slate-400 font-normal mb-4">
        Latest orders from your shop
      </span>
      <div className="rounded shadow-xl overflow-hidden border border-slate-700">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-slate-900 text-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 text-left">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-transparent">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  No orders found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-600 hover:bg-slate-800 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, subtitle, trend, icon: Icon }: any) => {
  const isPositive = trend >= 0;
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-slate-500" />}
      </div>
      <p className="text-white text-3xl font-bold mb-1">{value}</p>
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-xs">{subtitle}</span>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span
              className={`text-xs font-medium ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const SellerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsResponse = await axiosInstance.get(
        "/seller/api/dashboard/stats"
      );

      if (statsResponse.data.success) {
        setDashboardStats(statsResponse.data.data);
        setRecentOrders(statsResponse.data.data.recentOrders || []);

        const statusData = Object.entries(
          statsResponse.data.data.ordersByStatus || {}
        ).map(([name, value]) => ({
          name,
          value,
        }));
        setOrdersByStatus(statusData);
      }

      const salesResponse = await axiosInstance.get(
        "/seller/api/dashboard/sales-analytics?period=7d"
      );

      if (salesResponse.data.success) {
        const transformedSalesData = salesResponse.data.data.map(
          (item: any) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          })
        );
        setSalesData(transformedSalesData);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard data"
      );

      setDashboardStats({
        overview: {
          totalProducts: 0,
          activeProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
        },
        today: { orders: 0, revenue: 0 },
        changes: { ordersChange: 0, revenueChange: 0 },
        recentOrders: [],
        ordersByStatus: {},
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-4xl mb-2">😕</p>
          <p className="text-red-400 font-semibold mb-2">
            Unable to load dashboard data
          </p>
          <p className="text-slate-400 text-sm">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardStats?.overview || {};
  const today = dashboardStats?.today || {};
  const changes = dashboardStats?.changes || {};
  const last7Days = dashboardStats?.last7Days || {};
  const last30Days = dashboardStats?.last30Days || {};
  const thisMonth = dashboardStats?.thisMonth || {};

  return (
    <div className="p-8 min-h-screen bg-slate-950">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to Your Dashboard
        </h1>
        <p className="text-slate-400">
          Here's what's happening with your shop today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts?.toLocaleString() || "0"}
          subtitle={`${stats.activeProducts || 0} active`}
          icon={Package}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders?.toLocaleString() || "0"}
          subtitle="All time orders"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Revenue"
          value={`${(stats.totalRevenue || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="All time earnings"
          icon={DollarSign}
        />
        <StatsCard
          title="Top Product Sales"
          value={
            dashboardStats?.topProducts?.[0]?.totalSales?.toLocaleString() ||
            "0"
          }
          subtitle="Best seller"
          icon={Eye}
        />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatsCard
          title="Today's Orders"
          value={today.orders?.toLocaleString() || "0"}
          subtitle="Orders placed today"
          trend={changes.ordersChange}
        />
        <StatsCard
          title="Today's Revenue"
          value={`${(today.revenue || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Revenue generated today"
          trend={changes.revenueChange}
        />
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium mb-4">
            Last 7 Days
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-slate-400 text-xs">Orders</p>
              <p className="text-white text-2xl font-bold">
                {last7Days.orders || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Revenue</p>
              <p className="text-green-400 text-xl font-semibold">
                ${(last7Days.revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium mb-4">
            Last 30 Days
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-slate-400 text-xs">Orders</p>
              <p className="text-white text-2xl font-bold">
                {last30Days.orders || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Revenue</p>
              <p className="text-green-400 text-xl font-semibold">
                ${(last30Days.revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium mb-4">
            This Month
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-slate-400 text-xs">Orders</p>
              <p className="text-white text-2xl font-bold">
                {thisMonth.orders || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Revenue</p>
              <p className="text-green-400 text-xl font-semibold">
                ${(thisMonth.revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="w-full flex flex-col lg:flex-row gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="w-full lg:w-[65%] bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
          <h2 className="text-white text-xl font-semibold mb-2">
            Sales Performance
          </h2>
          <span className="block text-sm text-slate-400 font-normal mb-4">
            Last 7 days revenue and orders
          </span>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4ade80"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              No sales data available
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="w-full lg:w-[35%] bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
          <h2 className="text-white text-xl font-semibold mb-2">
            Order Status
          </h2>
          <span className="block text-sm text-slate-400 font-normal mb-4">
            Distribution by status
          </span>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="#0f172a"
                  strokeWidth={2}
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products Section */}
      {dashboardStats?.topProducts && dashboardStats.topProducts.length > 0 && (
        <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">
            <Eye className="inline w-5 h-5 mr-2" />
            Top Selling Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardStats.topProducts
              .slice(0, 6)
              .map((product: any, index: number) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 bg-slate-900 p-4 rounded-lg border border-slate-700"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <img
                    src={product.images?.[0]?.url || "/placeholder.png"}
                    alt={product.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {product.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-green-400 text-sm font-semibold">
                        {product.totalSales} sold
                      </p>
                      <p className="text-slate-400 text-xs">
                        ${product.sale_price}
                      </p>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
        <OrdersTable orders={recentOrders} />
      </div>
    </div>
  );
};

export default SellerDashboard;
