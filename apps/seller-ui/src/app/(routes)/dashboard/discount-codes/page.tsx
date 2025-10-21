"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ChevronRightIcon, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import Input from "packages/components/input";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DeleteDiscountCodeModal from "../../../../shared/components/modals/delete.discount-codes";
import axiosInstance from "../../../../utils/axiosinstance";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();

  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discount"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    },
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(
        "/product/api/create-discount-code",
        data
      );
      return res.data; // 👈 important
    },
    onSuccess: (data) => {
      toast.success("Discount code created successfully ✅");
      queryClient.invalidateQueries({ queryKey: ["shop-discount"] });
      reset();
      setShowModal(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to create discount");
    },
  });

  const DeleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId: string) => {
      await axiosInstance.delete(
        `/product/api/delete-discount-code/${discountId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discount"] });
      toast.success("Discount code deleted successfully ✅"); // show first
      setShowDeleteModal(false); // then close
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete discount");
    },
  });

  const handleDeleteClick = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("you can only create up to 8 discount codes");
      return;
    }
    createDiscountCodeMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-4">
        <h2 className="text-xl md:text-2xl font-semibold text-white">
          Discount Codes
        </h2>
        <button
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Create Discount
        </button>
      </div>
      {/* Bread crumbs */}
      <div className="flex items-center text-white text-sm mb-4">
        <Link href="/dashboard" className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRightIcon size={20} className="opacity-[.8]" />
        <span>Discount Codes</span>
      </div>

      {/* Availble discount codes */}

      <div className="mt-8 bg-gray-900 p-4 md:p-6 rounded-lg shadow-lg border border-gray-800">
        <h3 className="text-base md:text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>

        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts..</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-3 text-left text-sm md:text-base">Title</th>
                  <th className="p-3 text-left text-sm md:text-base">Type</th>
                  <th className="p-3 text-left text-sm md:text-base">Value</th>
                  <th className="p-3 text-left text-sm md:text-base">Code</th>
                  <th className="p-3 text-left text-sm md:text-base">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.map((discount: any) => (
                  <tr
                    key={discount?.id}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="p-3 text-sm md:text-base">
                      {discount?.public_name}
                    </td>

                    <td className="p-3 capitalize text-sm md:text-base">
                      {discount.discountType === "percentage"
                        ? "Percentage (%)"
                        : "Flat ($)"}
                    </td>

                    <td className="p-3 text-sm md:text-base">
                      {discount.discountType === "percentage"
                        ? `${discount.discountValue}%`
                        : `$${discount.discountValue}}`}
                    </td>

                    <td className="p-3 text-sm md:text-base">
                      {discount.discountCode}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => {
                          handleDeleteClick(discount);
                        }}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && discountCodes.length === 0 && (
          <p className="text-gray-400 w-full pt-4 block text-center">
            No Discount Codes Available
          </p>
        )}
      </div>

      {/* Create discount codes */}

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg md:text-xl text-white">
                Create Discount Code
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              {/* Title */}
              <Input
                label="Title (Public Name)"
                {...register("public_name", { required: "Title is required" })}
              />
              {errors.public_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.public_name.message}
                </p>
              )}

              {/* Discount types */}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Discount Type
                </label>

                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select
                      {...field}
                      className='w-full border outline-none border-gray-700 bg-transparent text-white p-2 rounded"'
                    >
                      <option className="bg-black" value="percentage">
                        Percentage (%)
                      </option>
                      <option className="bg-black" value="flat">
                        Flat Amount ($)
                      </option>
                    </select>
                  )}
                />
              </div>

              {/* Discount value */}

              <div className="mt-2">
                <Input
                  label="Discount Value"
                  type="number"
                  {...register("discountValue", {
                    required: "Discount value is required",
                    min: {
                      value: 1,
                      message: "Value must be at least 1",
                    },
                    max: {
                      value: 100,
                      message: "Percentage cannot exceed 100%", // default max for percentage
                    },
                    validate: (value, formValues) => {
                      if (formValues.discountType === "flat" && value > 10000) {
                        return "Flat discount cannot exceed $10,000";
                      }
                      return true;
                    },
                  })}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountValue.message as string}
                  </p>
                )}
              </div>

              {/* discount code */}

              <div className="mt-2">
                <Input
                  label="Discount Code"
                  {...register("discountCode", {
                    required: "Discount code is required",
                  })}
                />
                {errors.discountCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountCode.message as string}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={createDiscountCodeMutation.isPending}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={18} />{" "}
                {createDiscountCodeMutation.isPending
                  ? "Creating..."
                  : "Create"}
              </button>

              {createDiscountCodeMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  {(
                    createDiscountCodeMutation.error as AxiosError<{
                      message: string;
                    }>
                  )?.response?.data?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() =>
            DeleteDiscountCodeMutation.mutate(selectedDiscount?.id)
          }
          isLoading={DeleteDiscountCodeMutation.isPending}
        />
      )}
    </div>
  );
};

export default Page;
