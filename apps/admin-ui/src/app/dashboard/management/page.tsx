"use client";

import React, { useState } from "react";
import BreadCrumbs from "apps/admin-ui/src/shared/components/breadcrumbs";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosinstance";

const Page = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [editMode, setEditMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-all-admins");
      console.log("Full response:", res.data);

      return res.data.data || [];
    },
  });

  const { mutate: updateRole, isPending: updating } = useMutation({
    mutationFn: async () => {
      return await axiosInstance.put("/admin/api/add-new-admin", {
        email: email,
        role: selectedRole,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      handleCloseModal();
    },
    onError: (err) => {
      console.error("Role update failed", err);
    },
  });

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <button
          onClick={() => handleEdit(row.original)}
          className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600 text-xs"
        >
          Edit Role
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleEdit = (admin: any) => {
    setEditMode(true);
    setCurrentAdmin(admin);
    setEmail(admin.email);
    setSelectedRole(admin.role);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentAdmin(null);
    setEmail("");
    setSelectedRole("user");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRole();
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold tracking-wide">Team Management</h2>
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Admin
        </button>
      </div>

      <div className="mb-4">
        <BreadCrumbs title="Team Management" />
      </div>

      <div className="rounded shadow-xl border border-slate-700 overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-slate-900 text-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3">
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
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-red-500">
                  Failed to load admins.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-400">
                  No admins found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-700 hover:bg-slate-800 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-4 text-slate-400 hover:text-white text-2xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editMode ? "Edit Admin Role" : "Add New Admin"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@becodemy.com"
                  required
                  disabled={editMode}
                  className="w-full px-3 py-2 outline-none bg-slate-800 text-white border border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {editMode && (
                  <p className="text-xs text-slate-400 mt-1">
                    Email cannot be changed
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {editMode && currentAdmin && (
                  <p className="text-xs text-slate-400 mt-1">
                    Current role:{" "}
                    <span className="text-white">{currentAdmin.role}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed"
                >
                  {updating
                    ? "Updating..."
                    : editMode
                    ? "Update Role"
                    : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
