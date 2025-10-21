"use client";
import { useMemo, useState } from "react";

import {
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
import ResponsiveTable from "../../../../shared/components/responsive-table";
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
        header: "Image",
        cell: ({ row }: any) => {

          return (
            <Image
              src={row.original.images[0]?.url}
              alt={row.original.images[0]?.url}
              width={200}
              height={200}
              className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-md"
            />
          );
        },
      },

      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 15
              ? `${row.original.title.substring(0, 15)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_Link}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline text-xs sm:text-sm"
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
        cell: ({ row }: any) => <span className="text-xs sm:text-sm"> ${row.original.sale_price} </span>,
      },

      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={`text-xs sm:text-sm ${row.original.stock < 10 ? "text-red-500" : "text-white"}`}
          >
            {row.original.stock} left
          </span>
        ),
      },
      { 
        accessorKey: "category", 
        header: "Category",
        cell: ({ row }: any) => (
          <span className="text-xs sm:text-sm text-gray-300">{row.original.category}</span>
        ),
      },

      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
            <span className="text-white text-xs sm:text-sm">{row.original.ratings || 5}</span>
          </div>
        ),
      },

      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex gap-2 sm:gap-3">
            <Link
              href={`/product/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
              title="View"
            >
              <Eye size={14} className="sm:w-4 sm:h-4" />
            </Link>
            <Link
              href={`/product/edit/${row.original.id}`}
              className="text-yellow-400 hover:text-yellow-300 transition"
              title="Edit"
            >
              <Pencil size={14} className="sm:w-4 sm:h-4" />
            </Link>

            <button 
              className="text-green-400 hover:text-green-300 transition"
              title="Analytics"
            >
              <BarChart size={14} className="sm:w-4 sm:h-4" />
            </button>

            <button
              className="text-red-400 hover:text-red-300 transition"
              onClick={() => openDeleteModal(row.original)}
              title="Delete"
            >
              <Trash size={14} className="sm:w-4 sm:h-4" />
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
    <div className="w-full min-h-screen p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl text-white font-semibold">All Products</h2>
        <Link
          href={"/dashboard/create-product"}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={16} />
          Add New Product
        </Link>
      </div>
      {/* BreadCrumbs */}

      <div className="flex items-center mb-4">
        <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="text-gray-200" />
        <span className="text-white">All Products</span>
      </div>

      {/* search bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search className="text-gray-400 mr-2 flex-shrink-0" size={18} />

        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none text-sm sm:text-base"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
      {/* Table */}
      <div className="bg-gray-900 rounded-lg p-2 sm:p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading products...</p>
        ) : (
          <ResponsiveTable table={table} />
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
