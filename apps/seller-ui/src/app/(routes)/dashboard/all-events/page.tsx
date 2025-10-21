"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { saveAs } from "file-saver";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRightIcon,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
  Calendar,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import axiosInstance from "../../../../utils/axiosinstance";
import toast from "react-hot-toast";
import Input from '../../../../../../../packages/components/input';

const AllEventsPage = () => {
  const [page, setPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const queryClient = useQueryClient();
  const limit = 10;

  // Fetch events data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["seller-events", page],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/api/get-shop-events`);
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  const allEvents = data?.events || [];

  // Filter events client-side
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event: any) => {
      const values = Object.values(event).join(" ").toLowerCase();
      return values.includes(deferredGlobalFilter.toLowerCase());
    });
  }, [allEvents, deferredGlobalFilter]);

  // Delete event function
  const deleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await axiosInstance.delete(`/product/api/delete-event/${eventId}`);
      toast.success("Event deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["seller-events"] });
      refetch();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error(error?.response?.data?.message || "Failed to delete event");
    }
  };

  // Get event status based on dates
  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { status: "Upcoming", color: "text-blue-600 bg-blue-100" };
    } else if (now >= start && now <= end) {
      return { status: "Active", color: "text-green-600 bg-green-100" };
    } else {
      return { status: "Ended", color: "text-gray-600 bg-gray-100" };
    }
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "images",
        header: "Image",
        cell: ({ row }: any) => (
          <Image
            src={row.original.images?.[0]?.url || "/placeholder.png"}
            alt={row.original.title}
            width={50}
            height={50}
            className="w-12 h-12 object-cover rounded-lg"
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Event Title",
        cell: ({ row }: any) => (
          <div className="max-w-[200px]">
            <h3 className="font-medium text-white truncate">
              {row.original.title}
            </h3>
            <p className="text-sm text-gray-400 truncate">
              {row.original.short_description}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "sale_price",
        header: "Price",
        cell: ({ row }: any) => (
          <div className="text-white">
            <div className="font-medium">${row.original.sale_price}</div>
            {row.original.regular_price > row.original.sale_price && (
              <div className="text-sm text-gray-400 line-through">
                ${row.original.regular_price}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span className={`font-medium ${
            row.original.stock > 0 ? "text-green-400" : "text-red-400"
          }`}>
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: "starting_date",
        header: "Event Period",
        cell: ({ row }: any) => {
          const { status, color } = getEventStatus(
            row.original.starting_date,
            row.original.ending_date
          );
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Calendar className="w-3 h-3" />
                {new Date(row.original.starting_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="w-3 h-3" />
                {new Date(row.original.ending_date).toLocaleDateString()}
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${color}`}>
                {status}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => (
          <span className="text-gray-300">{row.original.category}</span>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/event/${row.original.slug}`}
              target="_blank"
              className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
              title="View Event"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={() => deleteEvent(row.original.id)}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete Event"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // React Table instance
  const table = useReactTable({
    data: filteredEvents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredEvents.length) return;

    const headers = [
      "Title",
      "Sale Price",
      "Regular Price",
      "Stock",
      "Start Date",
      "End Date",
      "Category",
      "Status",
    ];

    const rows = filteredEvents.map((e: any) => {
      const { status } = getEventStatus(e.starting_date, e.ending_date);
      return [
        e.title,
        e.sale_price,
        e.regular_price,
        e.stock,
        new Date(e.starting_date).toLocaleDateString(),
        new Date(e.ending_date).toLocaleDateString(),
        e.category,
        status,
      ];
    });

    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `events_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-950">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
        <span className="ml-2 text-gray-400">Loading events...</span>
      </div>
    );
  }

  // No Events Found
  if (!filteredEvents.length) {
    return (
      <div className="w-full min-h-screen px-6 py-8 bg-gray-950 flex flex-col items-center justify-center text-center">
        <Calendar className="w-16 h-16 text-gray-600 mb-4" />
        <p className="text-gray-400 text-lg mb-4">
          {allEvents.length === 0
            ? "No events created yet. Create your first event to get started!"
            : "No events found. Try adjusting your search."}
        </p>
        <div className="flex gap-4">
          {allEvents.length === 0 && (
            <Link
              href="/dashboard/create-event"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm transition"
            >
              Create Your First Event
            </Link>
          )}
          {deferredGlobalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="w-full min-h-screen px-4 sm:px-6 py-6 sm:py-8 bg-[#0F1117]">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">All Events</h2>
          <div className="flex items-center text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-blue-400">
              Dashboard
            </Link>
            <ChevronRightIcon size={16} className="mx-1" />
            <span>All Events</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition w-full sm:w-auto"
          >
            Export CSV
          </button>
          <Link
            href="/dashboard/create-event"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition w-full sm:w-auto text-center"
          >
            Create New Event
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1C1F29] p-4 rounded-lg border border-gray-700">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-400">Total Events</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{allEvents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1C1F29] p-4 rounded-lg border border-gray-700">
          <div className="flex items-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-400">Active</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {allEvents.filter((e: any) => {
                  const now = new Date();
                  const start = new Date(e.starting_date);
                  const end = new Date(e.ending_date);
                  return now >= start && now <= end;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#1C1F29] p-4 rounded-lg border border-gray-700">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-400">Upcoming</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {allEvents.filter((e: any) => new Date() < new Date(e.starting_date)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#1C1F29] p-4 rounded-lg border border-gray-700">
          <div className="flex items-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-400">Ended</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {allEvents.filter((e: any) => new Date() > new Date(e.ending_date)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="my-5 flex items-center bg-[#1C1F29] border border-gray-700 rounded-lg px-3 py-2">
        <Search size={18} className="text-gray-400 mr-2" />
        <Input
          type="text"
          placeholder="Search events..."
          className="flex-1 bg-transparent text-white outline-none border-none placeholder-gray-400"
          value={globalFilter}
          onChange={(e: any) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700 bg-[#1C1F29] shadow-sm">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full text-sm">
            <thead className="bg-[#20232D] border-b border-gray-600">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-4 py-3 font-semibold text-gray-200"
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
                  className="border-b border-gray-700 hover:bg-[#222633] transition"
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

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {table.getRowModel().rows.map((row) => {
            const { status, color } = getEventStatus(
              row.original.starting_date,
              row.original.ending_date
            );
            
            return (
              <div key={row.id} className="border-b border-gray-700 p-4 hover:bg-[#222633] transition">
                <div className="space-y-3">
                  {/* Event Image and Title */}
                  <div className="flex items-start gap-3">
                    <Image
                      src={row.original.images?.[0]?.url || "/placeholder.png"}
                      alt={row.original.title}
                      width={60}
                      height={60}
                      className="w-15 h-15 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate text-sm">
                        {row.original.title}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        {row.original.short_description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Price and Stock */}
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <div className="font-medium text-sm">${row.original.sale_price}</div>
                      {row.original.regular_price > row.original.sale_price && (
                        <div className="text-xs text-gray-400 line-through">
                          ${row.original.regular_price}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`font-medium text-sm ${
                        row.original.stock > 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        Stock: {row.original.stock}
                      </span>
                    </div>
                  </div>
                  
                  {/* Event Period and Status */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(row.original.starting_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(row.original.ending_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${color}`}>
                        {status}
                      </span>
                      <span className="text-xs text-gray-300">{row.original.category}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/event/${row.original.slug}`}
                      target="_blank"
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="View Event"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteEvent(row.original.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between items-center text-gray-400">
        <p className="text-sm">
          Showing {filteredEvents.length} of {allEvents.length} events
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllEventsPage;
