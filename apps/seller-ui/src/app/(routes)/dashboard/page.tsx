"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosinstance";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

type SellerOrders = Array<{
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}>;

type SellerOverview = {
  success: boolean;
  data: {
    totals: {
      totalRevenue12M: number;
      totalRevenueAllTime: number;
      totalOrders: number;
      totalViews: number;
      totalCartAdds: number;
      totalWishListAdds: number;
      totalPurchases: number;
    };
    revenueByMonth: { categories: string[]; series: number[] };
    recentOrders: SellerOrders;
  };
};

const fetchSellerOverview = async (): Promise<SellerOverview["data"]> => {
  const res = await axiosInstance.get("/seller/api/dashboard/overview");
  return res.data.data;
};

const SellerDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["seller-dashboard-overview"],
    queryFn: fetchSellerOverview,
    staleTime: 5 * 60 * 1000,
  });

  const orders = data?.recentOrders || [];
  const revenue = data?.totals.totalRevenue12M || 0;
  const paidOrders = orders.filter((o) => o.status === "Paid").length;
  const pendingOrders = orders.filter((o) => o.status !== "Paid").length;

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order",
        cell: ({ row }: any) => (
          <span className="text-sm font-medium text-white">#{row.original.id.slice(-6).toUpperCase()}</span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Customer",
        cell: ({ row }: any) => <span className="text-sm text-gray-300">{row.original.user?.name || "Guest"}</span>,
      },
      {
        accessorKey: "total",
        header: "Amount",
        cell: ({ row }: any) => (
          <span className="text-sm font-semibold text-green-400">${Number(row.original.total || 0).toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Payment",
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.original.status === "Paid"
                ? "bg-emerald-600/80 text-white"
                : "bg-yellow-500/80 text-white"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }: any) => (
          <span className="text-sm text-gray-400">{new Date(row.original.createdAt).toLocaleDateString()}</span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({ data: orders.slice(0, 8), columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="w-full min-h-screen px-4 md:px-6 py-8 bg-[#0F1117]">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Dashboard</h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#181B25] border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Revenue</div>
          <div className="text-2xl font-semibold text-white mt-1">${revenue.toFixed(2)}</div>
        </div>
        <div className="bg-[#181B25] border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Paid Orders</div>
          <div className="text-2xl font-semibold text-white mt-1">{paidOrders}</div>
        </div>
        <div className="bg-[#181B25] border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Pending Orders</div>
          <div className="text-2xl font-semibold text-white mt-1">{pendingOrders}</div>
        </div>
      </div>

      {/* Key interactions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#181B25] border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Views</div>
          <div className="text-xl font-semibold text-white mt-1">{data?.totals.totalViews ?? 0}</div>
        </div>
        <div className="bg-[#181B25] border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Cart Adds</div>
          <div className="text-xl font-semibold text-white mt-1">{data?.totals.totalCartAdds ?? 0}</div>
        </div>
        <div className="bg-[#181B25] border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Wishlists</div>
          <div className="text-xl font-semibold text-white mt-1">{data?.totals.totalWishListAdds ?? 0}</div>
        </div>
        <div className="bg-[#181B25] border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Purchases</div>
          <div className="text-xl font-semibold text-white mt-1">{data?.totals.totalPurchases ?? 0}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-gray-800 bg-[#181B25] shadow-sm">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-white text-lg font-semibold">Recent Orders</h3>
          <p className="text-sm text-gray-400">Latest transactions from your shop</p>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="text-center py-8 text-gray-400">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#20232D] border-b border-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="text-left px-4 py-3 font-semibold text-gray-300">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-800 hover:bg-[#222633] transition">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-gray-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
