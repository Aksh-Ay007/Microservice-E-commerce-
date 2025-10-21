"use client";
import { useMemo, useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  BarChart,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  Star,
  Trash,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import DeleteConfirmationModal from "../../../../shared/components/modals/delete.confirmation.modal";
import axiosInstance from "../../../../utils/axiosinstance";

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res?.data?.products;
};

const deleteProduct = async (productId: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`);
};

const restoreProduct = async (productId: string) => {
  await axiosInstance.put(`/product/api/restore-product/${productId}`);
};

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  //Delete product mutation

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });

  //restore product mutation
  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "images",
        header: "Images",
        cell: ({ row }: any) => {

          return (
            <Image
              src={row.original.images[0]?.url}
              alt={row.original.images[0]?.url}
              width={200}
              height={200}
              className="w-12 h-12 object-cover rounded-md"
            />
          );
        },
      },

      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_Link}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },

      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => <span> ${row.original.sale_price} </span>,
      },

      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? "text-red-500" : "text-white"}
          >
            {" "}
            {row.original.stock} left{" "}
          </span>
        ),
      },
      { accessorKey: "category", header: "Category" },

      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" />{" "}
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
      },

      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex  gap-3">
            <Link
              href={`/product/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`/product/edit/${row.original.id}`}
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              <Pencil size={18} />
            </Link>

            <button className="text-green-400 hover:text-green-300 transition">
              <BarChart size={18} />
            </button>

            <button
              className="text-red-400 hover:text-red-300 transition"
              onClick={() => openDeleteModal(row.original)}
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl text-white font-semibold">All Products</h2>
        <Link
          href={"/dashboard/create-product"}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add New Product</span>
          <span className="sm:hidden">Add Product</span>
        </Link>
      </div>
      {/* BreadCrumbs */}

      <div className="flex items-center mb-4">
        <Link href={"/dashboard"} className="text-blue-400 cursor-pointer text-sm sm:text-base">
          Dashboard
        </Link>
        <ChevronRight size={16} className="text-gray-200 mx-1" />
        <span className="text-white text-sm sm:text-base">All Products</span>
      </div>

      {/* search bar */}
      <div className="mb-4 flex items-center bg-[#1C1F29] border border-gray-700 p-3 rounded-lg flex-1">
        <Search className="text-gray-400 mr-2" size={18} />

        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none placeholder-gray-400"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
      {/* Table */}

      <div className="overflow-x-auto bg-[#1C1F29] rounded-lg border border-gray-700">
        {isLoading ? (
          <p className="text-center text-white py-8">Loading products...</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full text-white">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-gray-700">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="text-left p-4 font-semibold text-gray-300">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
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
                        <td key={cell.id} className="p-4">
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
              {table.getRowModel().rows.map((row) => (
                <div key={row.id} className="border-b border-gray-800 p-4 hover:bg-[#222633] transition">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={row.original.images[0]?.url}
                        alt={row.original.images[0]?.url}
                        width={80}
                        height={80}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`${process.env.NEXT_PUBLIC_USER_UI_Link}/product/${row.original.slug}`}
                            className="text-blue-400 hover:underline text-sm font-medium block truncate"
                            title={row.original.title}
                          >
                            {row.original.title}
                          </Link>
                          <p className="text-gray-400 text-xs mt-1">${row.original.sale_price}</p>
                          <p className="text-gray-400 text-xs">Stock: {row.original.stock}</p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2 ml-2">
                          <Link
                            href={`/product/${row.original.id}`}
                            className="text-blue-400 hover:text-blue-300 transition p-1"
                            title="View"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/product/edit/${row.original.id}`}
                            className="text-yellow-400 hover:text-yellow-300 transition p-1"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button 
                            className="text-green-400 hover:text-green-300 transition p-1"
                            title="Analytics"
                          >
                            <BarChart size={16} />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300 transition p-1"
                            onClick={() => openDeleteModal(row.original)}
                            title="Delete"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showDeleteModal && (
          <DeleteConfirmationModal
            product={selectedProduct}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
            onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;
