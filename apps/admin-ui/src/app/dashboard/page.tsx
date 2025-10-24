"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "recharts";
import GeographicalMap from "../../shared/components/charts/geographicalMap";
import SalesChart from "../../shared/components/charts/sale-chart";
import axiosInstance from "../../utils/axiosinstance";

const COLORS = ["#4ade80", "#facc15", "#60a5fa"];

type OverviewResponse = {
  success: boolean;
  data: {
    totals: {
      totalUsers: number;
      totalSellers: number;
      totalProducts: number;
      totalOrders: number;
      totalRevenue: number;
    };
    revenueByMonth: { categories: string[]; series: number[] };
    deviceStats: Array<{ name: string; value: number }>;
    countryStats: Array<{ name: string; users: number; sellers: number }>;
    recentOrders: Array<{
      id: string;
      customer: string;
      amount: number;
      status: string;
      createdAt: string;
      shopName?: string;
    }>;
  };
};

const fetchOverview = async (): Promise<OverviewResponse["data"]> => {
  const res = await axiosInstance.get("/admin/api/dashboard/overview");
  return res.data.data;
};

const OrdersTable = ({ orders }: { orders: OverviewResponse["data"]["recentOrders"] }) => {
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Order ID" },
      { accessorKey: "customer", header: "Customer" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }: any) => (
          <span className="text-sm font-semibold text-green-400">${Number(getValue() || 0).toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }: any) => {
          const value = getValue();
          const color =
            value === "Paid"
              ? "text-green-400"
              : value === "Pending"
              ? "text-yellow-400"
              : "text-red-400";
          return <span className={`font-medium ${color}`}>{value}</span>;
        },
      },
    ],
    []
  );

  const table = useReactTable({ data: orders, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="mt-6">
      <h2 className="text-white text-xl font-semibold mb-4">Recent Orders</h2>
      <span className="block text-sm text-slate-400 font-normal">A quick snapshot of your latest transactions.</span>
      <div className="!rounded shadow-xl overflow-hidden border border-slate-700">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-slate-900 text-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 text-left">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-transparent">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-600 hover:bg-slate-800 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: fetchOverview, staleTime: 5 * 60 * 1000 });

  const deviceData = data?.deviceStats || [
    { name: "Phone", value: 0 },
    { name: "Tablet", value: 0 },
    { name: "Computer", value: 0 },
  ];

  return (
    <div className="p-8">
      <div className="w-full flex gap-8">
        <div className="w-[65%]">
          <div className="rounded-2xl shadow-xl">
            <h2 className="text-white text-xl font-semibold">Revenue</h2>
            <span className="block text-sm text-slate-400 font-normal">Last 12 months performance</span>
            <SalesChart categories={data?.revenueByMonth.categories} series={data?.revenueByMonth.series} title="Revenue" />
          </div>
        </div>

        <div className="w-[35%] rounded-2xl shadow-xl mb-2">
          <h2 className="text-white text-xl font-semibold mb-2">Device Usage</h2>
          <span className="block text-sm text-slate-400 font-normal">How users access your platform</span>
          <div className="mt-14">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#000" floodOpacity="0.2" />
                  </filter>
                </defs>
                <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} stroke={"#0f172a"} strokeWidth={2} isAnimationActive filter="url(#shadow)">
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#fff" }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" formatter={(value) => <span className="text-white text-sm ml-1">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="w-full flex gap-8">
        <div className="w-[60%]">
          <h2 className="text-white text-xl font-semibold mt-6">User & Seller Distribution</h2>
          <span className="block text-sm text-slate-400 font-normal">Visual breakdown of global user & seller activity.</span>
          <GeographicalMap data={data?.countryStats} />
        </div>
        <div className="w-[40%]">
          <OrdersTable orders={data?.recentOrders || []} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
