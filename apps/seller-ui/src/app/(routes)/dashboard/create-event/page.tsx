"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRightIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import Input from "packages/components/input";
import RichTextEditor from "packages/components/rich-text-editor";
import { useMemo, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import axiosInstance from "../../../../utils/axiosinstance";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface EventFormData {
  productId: string;
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
  images: Array<{ fileId: string; file_url: string }>;
  customProperties: {};
  custom_specifications: {};
  discountCodes: string[];
}

const EventCreatePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      productId: "",
      stock: 1,
      sale_price: 1,
      regular_price: 1,
      short_description: "",
      detailed_description: "",
      tags: "",
      images: [],
      customProperties: {},
      custom_specifications: {},
      discountCodes: [],
    },
  });

  // Fetch seller's products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["shop-products-for-event"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-shop-products");
      return res.data.products;
    },
  });

  const products = productsData || [];

  // Fetch categories
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

  // When product is selected, auto-fill form fields
  useEffect(() => {
    if (selectedProductId) {
      const selectedProduct = products.find(
        (p: any) => p.id === selectedProductId
      );
      if (selectedProduct) {
        setValue("productId", selectedProduct.id);
        setValue("title", `Event: ${selectedProduct.title}`);
        setValue("slug", `event-${selectedProduct.slug}-${Date.now()}`);
        setValue("short_description", selectedProduct.short_description);
        setValue("detailed_description", selectedProduct.detailed_description);
        setValue("category", selectedProduct.category);
        setValue("subCategory", selectedProduct.subCategory);
        setValue("regular_price", selectedProduct.regular_price);
        setValue(
          "sale_price",
          Math.round(selectedProduct.sale_price * 0.8 * 100) / 100
        ); // 20% discount suggestion
        setValue("stock", selectedProduct.stock);
        setValue("tags", selectedProduct.tags.join(", "));
      }
    }
  }, [selectedProductId, products, setValue]);

  const onSubmit = async (data: EventFormData) => {
    if (!data.productId) {
      toast.error("Please select a product for this event");
      return;
    }

    const eventData = {
      productId: data.productId,
      title: data.title,
      slug: data.slug,
      short_description: data.short_description,
      detailed_description: data.detailed_description,
      category: data.category,
      subCategory: data.subCategory,
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
      router.push("/dashboard/all-events");
    } catch (error: any) {
      console.error("Event creation error:", error);
      toast.error(error?.response?.data?.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-4 md:p-8 text-white">
      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="font-medium text-gray-200">Create New Event</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-yellow-400" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Create Event Promotion
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Create a time-limited promotion for your products
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* --- Product Selection Section --- */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 md:p-6 rounded-lg shadow-lg border border-blue-700/50 space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              Step 1: Select Product
            </h2>
            <span className="text-red-400 text-sm">*Required</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choose Product to Promote
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={productsLoading}
            >
              <option value="">
                {productsLoading
                  ? "Loading products..."
                  : "-- Select a product --"}
              </option>
              {products.map((product: any) => (
                <option key={product.id} value={product.id}>
                  {product.title} - ${product.sale_price} (Stock:{" "}
                  {product.stock})
                </option>
              ))}
            </select>
            {!selectedProductId && (
              <p className="mt-2 text-sm text-blue-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Select a product to automatically fill event details
              </p>
            )}
          </div>

          {selectedProductId && (
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <p className="text-green-300 text-sm flex items-center gap-2">
                <span className="text-xl">✓</span>
                <span>
                  Product selected! Event will use this product's images and
                  details.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* --- Event Details Section --- */}
        <div className="bg-gray-900 p-4 md:p-6 rounded-lg shadow-lg border border-gray-800 space-y-6">
          <h2 className="text-lg md:text-xl font-semibold text-white border-b border-gray-700 pb-3">
            Step 2: Customize Event Details
          </h2>

          <Input
            label="Event Title"
            {...register("title", { required: "Event title is required" })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">
              {errors.title.message as string}
            </p>
          )}

          <Input
            label="URL Slug"
            description="Unique identifier for the event page URL."
            {...register("slug", { required: "Slug is required" })}
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">
              {errors.slug.message as string}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="starting_date"
              control={control}
              rules={{ required: "Starting date is required" }}
              render={({ field, fieldState }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Event Starting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...field}
                  />
                  {fieldState.error && (
                    <p className="mt-1 text-sm text-red-600">
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
                    Event Ending Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...field}
                  />
                  {fieldState.error && (
                    <p className="mt-1 text-sm text-red-600">
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
                <RichTextEditor
                  placeholder="Briefly describe the event promotion..."
                  value={field.value as string}
                  onChange={field.onChange}
                />
                {errors.short_description && (
                  <p className="mt-1 text-sm text-red-600">
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
                <RichTextEditor
                  placeholder="Add more details about your event..."
                  value={field.value as string}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          <Input
            label="Tags (Comma separated)"
            description="Keywords for event discovery"
            {...register("tags")}
          />
        </div>

        {/* --- Pricing & Category Section --- */}
        <div className="bg-gray-900 p-4 md:p-6 rounded-lg shadow-lg border border-gray-800 space-y-6">
          <h2 className="text-lg md:text-xl font-semibold text-white border-b border-gray-700 pb-3">
            Step 3: Set Event Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                {...register("category", { required: "Category is required" })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <p className="mt-1 text-sm text-red-600">
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
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 disabled:bg-gray-700 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Sub Category</option>
                {subCategories.map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              {errors.subCategory && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.subCategory.message as string}
                </p>
              )}
            </div>

            <Input
              label="Event Stock"
              type="number"
              {...register("stock", {
                required: "Stock is required",
                valueAsNumber: true,
                min: { value: 1, message: "Min 1" },
              })}
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">
                {errors.stock.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Regular Price ($)"
              type="number"
              step="0.01"
              {...register("regular_price", {
                required: "Regular Price is required",
                valueAsNumber: true,
              })}
            />
            {errors.regular_price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.regular_price.message as string}
              </p>
            )}
            <Input
              label="Event Sale Price ($)"
              type="number"
              step="0.01"
              description="Special discounted price for this event"
              {...register("sale_price", {
                required: "Sale Price is required",
                valueAsNumber: true,
                validate: (value) =>
                  Number(value) < Number(regularPrice) ||
                  "Sale price must be less than regular price",
              })}
            />
            {errors.sale_price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.sale_price.message as string}
              </p>
            )}
          </div>

          {selectedProductId && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>Note:</strong> This event will display using the
                selected product's images. Customers will see this as a
                time-limited promotion.
              </p>
            </div>
          )}
        </div>

        {/* --- Submission Button --- */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <p className="text-sm text-gray-400">
            {selectedProductId ? (
              <span className="text-green-400">✓ Ready to create event</span>
            ) : (
              <span className="text-yellow-400">
                ⚠ Please select a product first
              </span>
            )}
          </p>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading || !selectedProductId}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Event...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create Event Promotion
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventCreatePage;
