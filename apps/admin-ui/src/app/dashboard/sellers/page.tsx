"use client";

import BreadCrumbs from "apps/admin-ui/src/shared/components/breadcrumbs";
import React, { useMemo, useState, useDeferredValue } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Search, Download, Ban, Loader2 } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { saveAs } from "file-saver";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";

// types
type Shop = {
  name: string;
  avatar: string | null;
  address: string;
};

type Seller = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  shop: Shop | null; // shop data from your backend controller
};

type SellersResponse = {
  data: Seller[];
  meta: {
    totalSellers: number;
  };
};

const limit = 10;

const SellersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const queryClient = useQueryClient();

  // 1. Fetch Sellers Data
  const { data, isLoading }: UseQueryResult<SellersResponse, Error> = useQuery<
    SellersResponse,
    Error,
    SellersResponse,
    [string, number]
  >({
    queryKey: ["sellers-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-sellers?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });


  const banSellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      // Assuming a PUT route for banning a seller
      await axiosInstance.put(`/admin/api/ban-seller/${sellerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers-list"] });
      setIsModalOpen(false);
      setSelectedSeller(null);
    },
  });

  const allSellers = data?.data ?? [];

  // 3. Filtering Logic
  const filteredSellers = useMemo(() => {
    if (!data) return [];
    return allSellers.filter((seller) => {
      // Global filter only (role filter removed)
      const matchesGlobal = deferredGlobalFilter
        ? Object.values(seller)
            .join(" ")
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true;

      return matchesGlobal;
    });
  }, [allSellers, deferredGlobalFilter, data]);

  const totalPages = Math.ceil((data?.meta?.totalSellers ?? 0) / limit);

  // 4. Column Definitions for Sellers
  const columns = useMemo(
    () => [
      {
        accessorKey: "shop.avatar",
        header: "Avatar",
        cell: ({ row }: { row: any }) => (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
            {row.original.shop?.avatar ? (
              // Assuming 'shop.avatar' is a URL, you would use an Image component here
              <img src={row.original.shop.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              // Fallback for no avatar
              <span className="text-sm text-white">{row.original.name[0]}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "shop.name",
        header: "Shop Name",
        cell: ({ row }: { row: any }) => (
          <span className="font-medium text-blue-400">
            {row.original.shop?.name || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "shop.address",
        header: "Address",
        cell: ({ row }: { row: any }) => (
          <span className="text-gray-400">
            {row.original.shop?.address || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }: { row: any }) => (
          <span className="text-gray-400">
            {new Date(row.original.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: { row: any }) => (
          <div className="flex justify-center p-3">
            <button
              className="text-red-500 hover:text-red-400 transition"
              onClick={() => {
                setSelectedSeller(row.original);
                setIsModalOpen(true);
              }}
            >
              <Ban size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredSellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCSV = () => {
    const csvData = filteredSellers.map(
      (seller) =>
        `"${seller.name}","${seller.email}","${seller.shop?.name || 'N/A'}","${seller.shop?.address || 'N/A'}","${new Date(
          seller.createdAt
        ).toLocaleDateString("en-US")}"`
    );
    const blob = new Blob(
      ["Name,Email,Shop Name,Address,Joined\n", csvData.join("\n")],
      { type: "text/csv;charset=utf-8" }
    );
    saveAs(blob, `sellers-page-${page}.csv`);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">All Sellers</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md text-white transition flex items-center gap-1"
          >
            <Download size={18} /> Export CSV
          </button>
          {/* Role Filter REMOVED as sellers don't have a 'role' */}
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-400">
        <BreadCrumbs title="All Sellers" />
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center bg-gray-800 p-2 rounded-lg max-w-md">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search sellers..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 text-left text-gray-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-700 hover:bg-gray-800 transition"
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

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className={`px-4 py-1.5 rounded-md transition ${
            page === 1
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          Previous
        </button>

        <span className="px-4 py-1.5 bg-blue-600 rounded-md">{page}</span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className={`px-4 py-1.5 rounded-md transition ${
            page === totalPages
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          Next
        </button>
      </div>

      {/* Ban Confirmation Modal */}
      {isModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-[90%] max-w-md p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white text-lg font-semibold">Ban Seller</h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-300 leading-6">
                <span className="text-yellow-400 font-semibold">
                  Important:
                </span>{" "}
                Are you sure you want to ban the seller{" "}
                <span className="text-red-400 font-medium">
                  {selectedSeller.name}
                </span>
                ? This action can be reverted later.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={() => banSellerMutation.mutate(selectedSeller.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-sm text-white rounded-md flex items-center gap-1 transition"
              >
                <Ban size={16} /> Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellersPage;
