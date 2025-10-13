  "use client";

import React from "react";
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
import GeographicalMap from '../../shared/components/charts/geographicalMap';
import SalesChart from '../../shared/components/charts/sale-chart';


// Device data
const deviceData = [
  { name: "Phone", value: 55 },
  { name: "Tablet", value: 20 },
  { name: "Computer", value: 25 },
];

const COLORS = ["#4ade80", "#facc15", "#60a5fa"];

// Orders data
const orders = [
  { id: "ORD-001", customer: "John Doe", amount: "$250", status: "Paid" },
  { id: "ORD-002", customer: "Jane Smith", amount: "$180", status: "Pending" },
  { id: "ORD-003", customer: "Alice Johnson", amount: "$340", status: "Paid" },
  { id: "ORD-004", customer: "Bob Lee", amount: "$90", status: "Failed" },
  { id: "ORD-005", customer: "Bob Lee", amount: "$90", status: "Failed" },
  { id: "ORD-006", customer: "Bob Lee", amount: "$90", status: "Failed" },
];

// Orders table columns
const columns = [
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
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
];

const OrdersTable = () => {
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-6">
      <h2 className="text-white text-xl font-semibold mb-4">Recent Orders</h2>
      <span className="block text-sm text-slate-400 font-normal">
        A quick snapshot of your latest transactions.
      </span>
      <div className="!rounded shadow-xl overflow-hidden border border-slate-700">
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-slate-600 hover:bg-slate-800 transition"
              >
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

// Dashboard Layout
const DashboardPage = () => {
  return (
    <div className="p-8">
      {/* Top Charts */}
      <div className="w-full flex gap-8">
        {/* Revenue Chart */}
        <div className="w-[65%]">
          <div className="rounded-2xl shadow-xl">
            <h2 className="text-white text-xl font-semibold">Revenue</h2>
            <span className="block text-sm text-slate-400 font-normal">
              Last 6 months performance
            </span>
            {/* SalesChart would be rendered here */}
            <SalesChart/>
          </div>
        </div>

        {/* Device Usage */}
        <div className="w-[35%] rounded-2xl shadow-xl mb-2">
          <h2 className="text-white text-xl font-semibold mb-2">
            Device Usage
          </h2>
          <span className="block text-sm text-slate-400 font-normal">
            How users access your platform
          </span>
          <div className="mt-14">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <filter
                    id="shadow"
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="120%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="4"
                      floodColor="#000"
                      floodOpacity="0.2"
                    />
                  </filter>
                </defs>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke={"#0f172a"}
                  strokeWidth={2}
                  isAnimationActive
                  filter="url(#shadow)"
                >
                  {deviceData.map((entry, index) => (
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
                {/* External Legend */}
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-white text-sm ml-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Geo Map + Orders */}
      <div className="w-full flex gap-8">
        {/* Map */}
        <div className="w-[60%]">
          <h2 className="text-white text-xl font-semibold mt-6">
            User & Seller Distribution
          </h2>
          <span className="block text-sm text-slate-400 font-normal">
            Visual breakdown of global user & seller activity.
          </span>
          <GeographicalMap />
        </div>
        {/* Orders Table */}
        <div className="w-[40%]">
          <OrdersTable />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
