"use client";

import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronRightIcon, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Input from "../../../../../../../packages/components/input";
import axiosInstance from "../../../../utils/axiosinstance";

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-seller-orders");
  return res.data.orders;
};

const SellerPayments = () => {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: fetchOrders,
    staleTime: 5 * 60 * 1000,
  });

  // 🧮 Calculate total earnings
  const totalEarnings = useMemo(() => {
    if (!orders?.length) return 0;
    return orders.reduce(
      (sum: number, order: any) => sum + order.total * 0.9,
      0
    );
  }, [orders]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: any) => (
          <span className="text-sm font-medium text-white">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Customer",
        cell: ({ row }: any) => (
          <span className="text-sm text-gray-300">
            {row.original.user?.name ?? "Guest"}
          </span>
        ),
      },
      {
        header: "Seller Earning",
        cell: ({ row }: any) => {
          const sellerShare = row.original.total * 0.9;
          return (
            <span className="text-sm text-green-400">
              ${sellerShare.toFixed(2)}
            </span>
          );
        },
      },
      {
        header: "Admin Fee",
        cell: ({ row }: any) => {
          const adminFee = row.original.total * 0.1;
          return (
            <span className="text-sm text-yellow-400">
              ${adminFee.toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
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
          <span className="text-sm text-gray-400">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <Link
            href={`/order/${row.original.id}`}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
          >
            <Eye size={18} /> <span className="hidden sm:inline">View</span>
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 py-6 sm:py-8 bg-[#0F1117]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Payments</h2>
          <div className="flex items-center text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-blue-400">
              Dashboard
            </Link>
            <ChevronRightIcon size={16} className="mx-1" />
            <span>Payments</span>
          </div>
        </div>
      </div>

      {/* 💰 Total Earnings Summary */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#1C1F29] border border-gray-700 rounded-xl p-4 sm:p-5 flex flex-col items-start justify-center">
          <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
          <h3 className="text-xl sm:text-2xl font-semibold text-green-400">
            ${totalEarnings.toFixed(2)}
          </h3>
        </div>

        <div className="bg-[#1C1F29] border border-gray-700 rounded-xl p-4 sm:p-5 flex flex-col items-start justify-center">
          <p className="text-gray-400 text-sm mb-1">Total Orders</p>
          <h3 className="text-xl sm:text-2xl font-semibold text-white">{orders.length}</h3>
        </div>
      </div>

      {/* Search */}
      <div className="my-5 flex items-center bg-[#1C1F29] border border-gray-700 rounded-lg px-3 py-2">
        <Search size={18} className="text-gray-400 mr-2" />
        <Input
          type="text"
          placeholder="Search payments..."
          className="flex-1 bg-transparent text-white outline-none placeholder-gray-400"
          value={globalFilter}
          onChange={(e: any) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#181B25] shadow-sm">
        {isLoading ? (
          <p className="text-center py-8 text-gray-400">Loading payments...</p>
        ) : orders?.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No payments found.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead className="bg-[#20232D] border-b border-gray-700">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left px-4 py-3 font-semibold text-gray-300"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-800 hover:bg-[#222633] transition"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-gray-200">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {table.getRowModel().rows.map((row) => {
                const sellerShare = row.original.total * 0.9;
                const adminFee = row.original.total * 0.1;
                
                return (
                  <div key={row.id} className="border-b border-gray-800 p-4 hover:bg-[#222633] transition">
                    <div className="space-y-3">
                      {/* Order ID and Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          #{row.original.id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.original.status === "Paid"
                              ? "bg-emerald-600/80 text-white"
                              : "bg-yellow-500/80 text-white"
                          }`}
                        >
                          {row.original.status}
                        </span>
                      </div>
                      
                      {/* Customer and Earnings */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300">
                          Customer: {row.original.user?.name ?? "Guest"}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Your Earnings</p>
                            <p className="text-green-400 font-semibold">${sellerShare.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Admin Fee</p>
                            <p className="text-yellow-400 font-semibold">${adminFee.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(row.original.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex justify-end">
                        <Link
                          href={`/order/${row.original.id}`}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition text-sm"
                        >
                          <Eye size={16} />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SellerPayments;
