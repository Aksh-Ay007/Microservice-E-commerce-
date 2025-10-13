"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { saveAs } from "file-saver";
import axiosInstance from "../../../utils/axiosinstance";

const limit = 10;

const AdminProductsPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-products?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );

  const products = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  // ✅ Export CSV handler
  const exportCSV = () => {
    if (!products.length) return;

    const csvData = products.map((p: any) =>
      [
        `"${p.title}"`,
        `"${p.sale_price}"`,
        `"${p.stock}"`,
        `"${p.category}"`,
        `"${p.ratings}"`,
        `"${p.Shop?.name || "-"}"`,
        `"${new Date(p.createdAt).toLocaleDateString("en-US")}"`,
      ].join(",")
    );

    const blob = new Blob(
      [
        `Title,Price,Stock,Category,Rating,Shop,Created At\n${csvData.join(
          "\n"
        )}`,
      ],
      { type: "text/csv;charset=utf-8" }
    );

    saveAs(blob, `products-page-${page}.csv`);
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">All Products</h2>
        <button
          onClick={exportCSV}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-white transition"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 text-left text-gray-300">
              <th className="p-3">Image</th>
              <th className="p-3">Product Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Category</th>
              <th className="p-3 text-center">Rating</th>
              <th className="p-3">Shop</th>
              <th className="p-3">Created At</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product: any) => (
              <tr
                key={product.id}
                className="border-b border-gray-700 hover:bg-gray-800 transition"
              >
                {/* Image */}
                <td className="p-3">
                  <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-700">
                    <Image
                      src={product.images?.[0]?.url || "/no-image.png"}
                      alt={product.title}
                      width={50}
                      height={50}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </td>

                {/* Product Name */}
                <td className="p-3 font-medium max-w-[180px] truncate">
                  {product.title}
                </td>

                {/* Price */}
                <td className="p-3">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(product.sale_price || 0)}
                </td>

                {/* Stock */}
                <td className="p-3">
                  {product.stock <= 5 ? (
                    <span className="text-red-400 font-semibold">
                      {product.stock} left
                    </span>
                  ) : (
                    <span>{product.stock} left</span>
                  )}
                </td>

                {/* Category */}
                <td className="p-3 capitalize">{product.category}</td>

                {/* Rating */}
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>⭐</span>
                    <span>{product.ratings || 0}</span>
                  </div>
                </td>

                {/* Shop */}
                <td className="p-3">{product.Shop?.name || "—"}</td>

                {/* CreatedAt */}
                <td className="p-3">
                  {new Date(product.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="p-3 text-center">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${product.slug}`}
                    className="text-blue-400 hover:text-blue-300 transition"
                  >
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
    </div>
  );
};

export default AdminProductsPage;
