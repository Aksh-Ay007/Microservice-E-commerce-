"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
// Cannot fix these "module not found" errors, assuming paths are correct:
import Input from "packages/components/input";
import RichTextEditor from "packages/components/rich-text-editor";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import axiosInstance from "../../../../utils/axiosinstance";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Define the minimal product/event data structure
interface EventFormData {
  title: string;
  slug: string;
  short_description: string;
  detailed_description?: string;
  starting_date: string;
  ending_date: string;
  tags: string;
  category: string;
  subCategory: string;
  stock: number | string;
  sale_price: number | string;
  regular_price: number | string;
  // Minimal fields to satisfy the product model
  images: Array<{ fileId: string; file_url: string }>;
  customProperties: {};
  custom_specifications: {};
  discountCodes: string[];
}

const EventCreatePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      stock: 1,
      sale_price: 1,
      regular_price: 1,
      short_description: "Limited time event",
      detailed_description: "Join our flash event for amazing deals!",
      tags: "event, sale, deal",
      images: [],
      customProperties: {},
      custom_specifications: {},
      discountCodes: [],
    },
  });

  // --- (Data Fetching: Categories) ---
  const { data, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};
  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  // --- (Form Submission) ---

  const onSubmit = async (data: EventFormData) => {
    const eventData = {
      ...data,
      stock: parseInt(String(data.stock), 10),
      sale_price: parseFloat(String(data.sale_price)),
      regular_price: parseFloat(String(data.regular_price)),
      images: [],
      tags: Array.isArray(data.tags)
        ? data.tags
        : String(data.tags)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
      starting_date: data.starting_date,
      ending_date: data.ending_date,
      colors: [],
      sizes: [],
    };

    try {
      setLoading(true);
      const res = await axiosInstance.post(
        "/product/api/create-event",
        eventData
      );

      toast.success(res.data.message || "Event created successfully!");
      router.push("/seller/events");
    } catch (error: any) {
      console.error("Event creation error:", error);
      toast.error(error?.response?.data?.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  // --- (Render logic) ---

  return (
    <div className="w-full mx-auto p-4 md:p-8 text-white">
      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
        <Link
          href="/dashboard"
          className="hover:text-blue-400 transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="font-medium text-gray-300">Create New Event</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-6">
        Create New Event
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* --- Core Event Details Section --- */}
        <div className="bg-[#1C1F29] p-4 lg:p-6 rounded-lg shadow-md space-y-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">
            Event Details
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Event Title
            </label>
            <input
              {...register("title", { required: "Event title is required" })}
              className="w-full px-3 py-2 bg-[#2A2D3A] border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">
                {errors.title.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              URL Slug
            </label>
            <p className="text-xs text-gray-400">Unique identifier for the event page URL.</p>
            <input
              {...register("slug", { required: "Slug is required" })}
              className="w-full px-3 py-2 bg-[#2A2D3A] border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-400">
                {errors.slug.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="starting_date"
              control={control}
              rules={{ required: "Starting date is required" }}
              render={({ field, fieldState }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Event Starting Date
                  </label>
                  {/* ✅ FIX APPLIED: Using standard HTML input for 'datetime-local' */}
                  <input
                    type="datetime-local"
                    className="w-full bg-[#2A2D3A] border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...field}
                  />
                  {fieldState.error && (
                    <p className="mt-1 text-sm text-red-400">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="ending_date"
              control={control}
              rules={{ required: "Ending date is required" }}
              render={({ field, fieldState }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Event Ending Date
                  </label>
                  {/* ✅ FIX APPLIED: Using standard HTML input for 'datetime-local' */}
                  <input
                    type="datetime-local"
                    className="w-full bg-[#2A2D3A] border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...field}
                  />
                  {fieldState.error && (
                    <p className="mt-1 text-sm text-red-400">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <Controller
            name="short_description"
            control={control}
            rules={{ required: "Short description is required" }}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Short Description
                </label>
                {/* ⚠️ FIX APPLIED: Only passing field props (value, onChange) */}
                <RichTextEditor
                  placeholder="Briefly describe the event..."
                  value={field.value as string}
                  onChange={field.onChange}
                />
                {errors.short_description && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.short_description.message as string}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="detailed_description"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Detailed Description (Optional)
                </label>
                {/* ⚠️ FIX APPLIED: Only passing field props (value, onChange) */}
                <RichTextEditor
                  value={field.value as string}
                  onChange={field.onChange}
                />
                {errors.detailed_description && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>
            )}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Tags (Comma separated)
            </label>
            <p className="text-xs text-gray-400">Keywords to help customers find your event (e.g., flash sale, deals)</p>
            <input
              {...register("tags")}
              className="w-full px-3 py-2 bg-[#2A2D3A] border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-400">
                {errors.tags.message as string}
              </p>
            )}
          </div>
        </div>

        {/* --- Minimal Product Data (Required by the underlying 'products' model) --- */}
        <div className="bg-[#1C1F29] p-4 lg:p-6 rounded-lg shadow-md space-y-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">
            Associated Product Information (Required)
          </h2>

          <p className="text-sm text-gray-400">
            Since events use the product data structure, provide minimal
            information for the product associated with this event.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                {...register("category", { required: "Category is required" })}
                className="w-full bg-[#2A2D3A] border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categories.map((cat: string) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))
                )}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.category.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Sub Category
              </label>
              <select
                {...register("subCategory", {
                  required: "Sub Category is required",
                })}
                disabled={!selectedCategory || subCategories.length === 0}
                className="w-full bg-[#2A2D3A] border border-gray-600 text-white rounded-lg p-2.5 disabled:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Sub Category</option>
                {subCategories.map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              {errors.subCategory && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.subCategory.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Stock Quantity
              </label>
              <input
                type="number"
                {...register("stock", {
                  required: "Stock is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Min 1" },
                })}
                className="w-full px-3 py-2 bg-[#2A2D3A] border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.stock.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Regular Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("regular_price", {
                  required: "Regular Price is required",
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 bg-[#2A2D3A] border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.regular_price && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.regular_price.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Sale Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("sale_price", {
                  required: "Sale Price is required",
                  valueAsNumber: true,
                  validate: (value) =>
                    Number(value) < Number(regularPrice) ||
                    "Sale price must be less than regular price",
                })}
                className="w-full px-3 py-2 bg-[#2A2D3A] border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.sale_price && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.sale_price.message as string}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- Submission Button --- */}
        <div className="pt-6 border-t border-gray-700 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventCreatePage;
