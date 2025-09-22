"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import ColorSelector from "packages/components/color-selector";
import CustomSpecifications from "packages/components/custom-specifications";
import Input from "packages/components/input";
import RichTextEditor from "packages/components/rich-text-editor";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomProperties from "../../../../../../../packages/components/custom-properties";
import SizeSelector from "../../../../../../../packages/components/size-selector";
import ImagePlaceHolder from "../../../../shared/components/image-placeholder";
import axiosInstance from "../../../../utils/axiosinstance";

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");

        return res.data;
      } catch (error) {
        console.log(error);
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

  const handleImageChange = (file: File | null, index: number) => {
    const newImages = [...images];
    newImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      newImages.push(null);
      setValue("images", newImages);
    }

    setImages(newImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      return updatedImages;
    });

    setValue("images", images);
  };

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const handleSaveDraft = () => {};

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Heading and breadcrumbs */}

      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>

      <div className="flex items-center">
        <Link href="/dashboard" className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRightIcon size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>
      {/* content Layout */}

      <div className="py-4 w-full flex gap-6">
        {/* Left side-image upload section */}

        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765*850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                setOpenImageModal={setOpenImageModal}
                size="765*850"
                key={index}
                small
                index={index + 1}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        {/* Right side-form inputs*/}

        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product title inputs */}

            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter Product Title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}

              {/* Descriptions */}

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register("description", {
                    required: "Description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannont be more than 150 words (Current:${wordCount})`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              {/* Tags */}

              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="Enter product tags"
                  {...register("tags", {
                    required: "Seperate related products tags with a coma,",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              {/* warranty */}

              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="1 year/no Warranty"
                  {...register("warranty", {
                    required: "Warranty is required!",
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>

              {/* slug */}

              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register("slug", {
                    required: "Slug is required!",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

                      message:
                        "Invalid slug format! Use only lowercase letters,numbers,and hyphens",
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must be at least 3 characters long",
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug cannot be more than 50 characters long",
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              {/*Brand  */}

              <div className="mt-2">
                <Input
                  label="Brand *"
                  placeholder="Apple"
                  {...register("brand")}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>

              {/*Color */}

              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              {/*CustomSpecifications  */}

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              {/*CustomProperties  */}

              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              {/*Cash on delivery */}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on delivery is required",
                  })}
                  defaultValue="yes"
                  className="w-full border outline-none border-gray-700 bg-transparent text-white p-2 rounded"
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* category  */}

            <div className="w-2/4">
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>

              {isLoading ? (
                <p className="text-gray-400">Loading categories...</p>
              ) : isError ? (
                <p className="text-red-500">Error loading categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent text-white p-2 rounded"
                    >
                      <option value="" className="bg-black">
                        Select Category
                      </option>

                      {categories?.map((category: string) => (
                        <option
                          value={category}
                          key={category}
                          className="bg-black"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}

              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              {/* sub cat */}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Sub Category *
                </label>

                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: "SubCategory is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent text-white p-2 rounded"
                    >
                      <option value="" className="bg-black">
                        Select SubCategory
                      </option>

                      {subCategories?.map((subcategory: string) => (
                        <option
                          value={subcategory}
                          key={subcategory}
                          className="bg-black"
                        >
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subCategory.message as string}
                  </p>
                )}
              </div>

              {/* text editor */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description *(Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required",
                    validate: (value) => {
                      const wordCount = value
                        ?.split(/\s+/)
                        .filter((word: string) => word).length;

                      return (
                        wordCount >= 100 ||
                        "Detailed description must be at least 100 words"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>

              {/* video url */}

              <div className="mt-2">
                <Input
                  label="Video URL *"
                  placeholder="https://www.youtube.com/embed/xyz123"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        "Invalid YouTube embed URL! Use format: https://www.youtube.com/embed/xyz123",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              {/* regular price */}

              <div className="mt-2">
                <Input
                  label="Regular Price *"
                  placeholder="20$"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least 1" },
                    validate: (value) =>
                      !isNaN(value) || "Price must be a number",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              {/* sell price */}

              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="15$"
                  {...register("sale_price", {
                    required: "Sale price is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least 1" },

                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";

                      if (regularPrice && value >= regularPrice) {
                        return "Sale price cannot be greater than or equal to regular price";
                      }

                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              {/* stock */}

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Stock must be at least 1" },
                    max: {
                      value: 1000,
                      message: "Stock cannot be more than 1000",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (!Number.isInteger(value))
                        return "Stock must be a number!";
                      return true;
                    },
                  })}
                />

                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              {/* size selecting */}

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (optional)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            Save Draft
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default Page;
