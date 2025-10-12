"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../../utils/axiosinstance";

const OrderTable = () => {
  const router = useRouter();

  // ✅ Fetch user orders with react-query
  const { data, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-user-orders");
      return res.data.orders;
    },
  });

  // ✅ Column Definitions
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: (info: any) => info.getValue()?.slice(-6),
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "total",
      header: "Total ($)",
      cell: (info: any) => `$${info.getValue()?.toFixed(2)}`,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: (info: any) => new Date(info.getValue())?.toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/order/${row.original.id}`)}
          className="gap-1 text-blue-600 hover:underline text-xs flex items-center transition"
        >
          Track Order <ArrowRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  // ✅ React Table Instance
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading)
    return <p className="text-sm  text-gray-500">Loading orders...</p>;

  // ✅ Render Table
  return (
    <div className="overflow-x-auto ">
      {data?.length === 0 && (
        <p className="text-center h-[30vh] items-center fle justify-center">
          No orders found.
        </p>
      )}

      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 font-semibold text-gray-700 text-left"
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
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-gray-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
