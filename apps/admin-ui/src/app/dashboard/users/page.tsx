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
import axiosInstance from '../../../utils/axiosinstance';

// types
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type UsersResponse = {
  data: User[];
  meta: {
    totalUsers: number;
  };
};

const limit = 10;

const UsersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const queryClient = useQueryClient();

  const { data, isLoading }: UseQueryResult<UsersResponse, Error> = useQuery<
    UsersResponse,
    Error,
    UsersResponse,
    [string, number]
  >({
    queryKey: ["users-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-users?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.put(`/admin/api/ban-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setIsModalOpen(false);
      setSelectedUser(null);
    },
  });

  const allUsers = data?.data ?? [];

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    return allUsers.filter((user) => {
      const matchesRole = roleFilter
        ? user.role.toLowerCase() === roleFilter.toLowerCase()
        : true;

      const matchesGlobal = deferredGlobalFilter
        ? Object.values(user)
            .join(" ")
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true;

      return matchesRole && matchesGlobal;
    });
  }, [allUsers, roleFilter, deferredGlobalFilter, data]);

  const totalPages = Math.ceil((data?.meta?.totalUsers ?? 0) / limit);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }: { row: any }) => (
          <span className="uppercase font-semibold text-blue-400">
            {row.original.role}
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
                setSelectedUser(row.original);
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
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCSV = () => {
    const csvData = filteredUsers.map(
      (user) =>
        `"${user.name}","${user.email}","${user.role}","${new Date(
          user.createdAt
        ).toLocaleDateString("en-US")}"`
    );
    const blob = new Blob(
      ["Name,Email,Role,Created At\n", csvData.join("\n")],
      { type: "text/csv;charset=utf-8" }
    );
    saveAs(blob, `users-page-${page}.csv`);
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
        <h2 className="text-2xl font-semibold">All Users</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-white transition flex items-center gap-1"
          >
            <Download size={18} /> Export CSV
          </button>
          <select
            className="bg-gray-800 border border-gray-700 p-2 rounded-md text-white outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-400">
        <BreadCrumbs title="All Users" />
      </div>

      {/* Search Bar (Matching AdminProductsPage style) */}
      <div className="mb-6 flex items-center bg-gray-800 p-2 rounded-lg max-w-md">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users..."
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

      {/* Pagination Controls (Matching AdminProductsPage style) */}
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

      {/* Ban Confirmation Modal (Adjusted background color) */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-[90%] max-w-md p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white text-lg font-semibold">Ban User</h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-300 leading-6">
                <span className="text-yellow-400 font-semibold">
                  Important:
                </span>{" "}
                Are you sure you want to ban{" "}
                <span className="text-red-400 font-medium">
                  {selectedUser.name}
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
                onClick={() => banUserMutation.mutate(selectedUser.id)}
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

export default UsersPage;
