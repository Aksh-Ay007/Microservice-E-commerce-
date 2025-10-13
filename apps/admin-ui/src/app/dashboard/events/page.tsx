"use client";

import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { saveAs } from "file-saver"; // ✅ CSV export
import {
  ChevronLeft,
  ChevronRight,
  ChevronRightIcon,
  Loader2,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import Input from "../../../../../../packages/components/input";
import axiosInstance from "../../../utils/axiosinstance";

const EventPage = () => {
  const [page, setPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const limit = 10;

  // ✅ Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ["event-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-events?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  const allEvents = data?.data || [];
  const totalPages = Math.ceil((data?.meta?.totalEvents ?? 0) / limit);

  // ✅ Filter events client-side
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event: any) => {
      const values = Object.values(event).join(" ").toLowerCase();
      return values.includes(deferredGlobalFilter.toLowerCase());
    });
  }, [allEvents, deferredGlobalFilter]);

  // ✅ Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "images",
        header: "Image",
        cell: ({ row }: any) => (
          <Image
            src={row.original.images?.[0]?.url || "/placeholder.png"}
            alt={row.original.title}
            width={40}
            height={40}
            className="w-10 h-10 object-cover rounded"
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }: any) => (
          <Link
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "sale_price",
        header: "Price",
        cell: ({ row }: any) => `$${row.original.sale_price}`,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => row.original.stock ?? "N/A",
      },
      {
        accessorKey: "starting_date",
        header: "Start",
        cell: ({ row }) =>
          row.original.starting_date
            ? new Date(row.original.starting_date).toLocaleDateString()
            : "—",
      },
      {
        accessorKey: "ending_date",
        header: "End",
        cell: ({ row }) =>
          row.original.ending_date
            ? new Date(row.original.ending_date).toLocaleDateString()
            : "—",
      },
      {
        accessorKey: "shop.name",
        header: "Shop Name",
        cell: ({ row }) => row.original.Shop?.name || "N/A",
      },
    ],
    []
  );

  // ✅ React Table instance
  const table = useReactTable({
    data: filteredEvents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  // ✅ CSV Export
  const handleExportCSV = () => {
    if (!filteredEvents.length) return;

    const headers = [
      "Title",
      "Sale Price",
      "Stock",
      "Start Date",
      "End Date",
      "Shop Name",
    ];

    const rows = filteredEvents.map((e: any) => [
      e.title,
      e.sale_price,
      e.stock,
      e.starting_date ? new Date(e.starting_date).toLocaleDateString() : "—",
      e.ending_date ? new Date(e.ending_date).toLocaleDateString() : "—",
      e.Shop?.name || "N/A",
    ]);

    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `events_page_${page}.csv`);
  };

  // ✅ Pagination Handlers
  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );
  }

  // ✅ No Events Found
  if (!filteredEvents.length) {
    return (
      <div className="w-full min-h-screen px-6 py-8 bg-[#0F1117] flex flex-col items-center justify-center text-center">
        <p className="text-gray-400 text-lg mb-4">
          No events found. Try adjusting your search or filters.
        </p>
        <button
          onClick={() => setGlobalFilter("")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className="w-full min-h-screen px-6 py-8 bg-[#0F1117]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Events</h2>
          <div className="flex items-center text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-blue-400">
              Dashboard
            </Link>
            <ChevronRightIcon size={16} className="mx-1" />
            <span>Events</span>
          </div>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Export CSV
        </button>
      </div>

      {/* Search Bar */}
      <div className="my-5 flex items-center bg-[#1C1F29] border border-gray-700 rounded-lg px-3 py-2">
        <Search size={18} className="text-gray-400 mr-2" />
        <Input
          type="text"
          placeholder="Search events..."
          className="flex-1 bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e: any) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#181B25] shadow-sm">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 text-gray-300">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-700 hover:bg-[#1F222B] transition ${
            page === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <span className="text-sm">
          Page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </span>

        <button
          onClick={handleNext}
          disabled={page >= totalPages}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-700 hover:bg-[#1F222B] transition ${
            page >= totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default EventPage;
