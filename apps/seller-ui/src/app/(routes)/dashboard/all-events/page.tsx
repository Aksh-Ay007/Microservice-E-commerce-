"use client";

import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRightIcon,
  Loader2,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import Input from "packages/components/input";
import axiosInstance from "../../../../utils/axiosinstance";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const AllEventsPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const limit = 10;

  // Fetch events
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["seller-events", page],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-shop-events");
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
          <div className="max-w-[200px]">
            <p className="font-medium text-gray-900 truncate">{row.original.title}</p>
            <p className="text-sm text-gray-500 truncate">{row.original.short_description}</p>
          </div>
        ),
      },
      {
        accessorKey: "sale_price",
        header: "Price",
        cell: ({ row }: any) => (
          <div>
            <p className="font-semibold text-green-600">${row.original.sale_price}</p>
            <p className="text-sm text-gray-500 line-through">${row.original.regular_price}</p>
          </div>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.original.stock > 10 
              ? 'bg-green-100 text-green-800' 
              : row.original.stock > 0 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
          }`}>
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: "starting_date",
        header: "Start Date",
        cell: ({ row }: any) => (
          <div className="text-sm">
            <p className="font-medium">
              {row.original.starting_date
                ? new Date(row.original.starting_date).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-gray-500">
              {row.original.starting_date
                ? new Date(row.original.starting_date).toLocaleTimeString()
                : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "ending_date",
        header: "End Date",
        cell: ({ row }: any) => (
          <div className="text-sm">
            <p className="font-medium">
              {row.original.ending_date
                ? new Date(row.original.ending_date).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-gray-500">
              {row.original.ending_date
                ? new Date(row.original.ending_date).toLocaleTimeString()
                : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => {
          const now = new Date();
          const startDate = new Date(row.original.starting_date);
          const endDate = new Date(row.original.ending_date);
          
          let status = "Draft";
          let statusColor = "bg-gray-100 text-gray-800";
          
          if (now < startDate) {
            status = "Upcoming";
            statusColor = "bg-blue-100 text-blue-800";
          } else if (now >= startDate && now <= endDate) {
            status = "Live";
            statusColor = "bg-green-100 text-green-800";
          } else if (now > endDate) {
            status = "Ended";
            statusColor = "bg-red-100 text-red-800";
          }
          
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/product/${row.original.slug}`)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="View Event"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push(`/dashboard/edit-event/${row.original.id}`)}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Edit Event"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteEvent(row.original.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete Event"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [router]
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

  // Delete event handler
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await axiosInstance.delete(`/product/api/delete-event/${eventId}`);
      toast.success("Event deleted successfully");
      refetch();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error(error?.response?.data?.message || "Failed to delete event");
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );
  }

  // No Events Found
  if (!filteredEvents.length) {
    return (
      <div className="w-full min-h-screen px-6 py-8 bg-[#0F1117] flex flex-col items-center justify-center text-center">
        <Calendar className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-400 text-lg mb-4">
          No events found. Create your first event to get started!
        </p>
        <Link
          href="/dashboard/create-event"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm transition"
        >
          Create Event
        </Link>
      </div>
    );
  }

  // Main UI
  return (
    <div className="w-full min-h-screen px-6 py-8 bg-[#0F1117]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">My Events</h2>
          <div className="flex items-center text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-blue-400">
              Dashboard
            </Link>
            <ChevronRightIcon size={16} className="mx-1" />
            <span>Events</span>
          </div>
        </div>

        <Link
          href="/dashboard/create-event"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Create New Event
        </Link>
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

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1C1F29] p-4 rounded-lg">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-white">{allEvents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1C1F29] p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Live Events</p>
              <p className="text-2xl font-bold text-white">
                {allEvents.filter((event: any) => {
                  const now = new Date();
                  const startDate = new Date(event.starting_date);
                  const endDate = new Date(event.ending_date);
                  return now >= startDate && now <= endDate;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#1C1F29] p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-white">
                {allEvents.filter((event: any) => {
                  const now = new Date();
                  const startDate = new Date(event.starting_date);
                  return now < startDate;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#1C1F29] p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Ended</p>
              <p className="text-2xl font-bold text-white">
                {allEvents.filter((event: any) => {
                  const now = new Date();
                  const endDate = new Date(event.ending_date);
                  return now > endDate;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllEventsPage;