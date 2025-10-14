"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosinstance";
import toast from "react-hot-toast";
import BreadCrumbs from "apps/admin-ui/src/shared/components/breadcrumbs";

const tabs = ["Categories", "Logo", "Banner"];

const Customization: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Categories");
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, string[]>>(
    {}
  );
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch existing customization data
  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const res = await axiosInstance.get("/admin/api/get-all");
        const data = res.data;
        setCategories(data.categories || []);
        setSubCategories(data.subCategories || {});
        setLogo(data.logo || null);
        setBanner(data.banner || null);
      } catch (err) {
        console.error("Failed to fetch customization data", err);
        toast.error("Failed to load customization data");
      }
    };
    fetchCustomization();
  }, []);

  // ✅ Convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  // ✅ Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim())
      return toast.error("Category name cannot be empty");

    try {
      setLoading(true);
      const res = await axiosInstance.post("/admin/api/add-category", {
        category: newCategory.trim(),
      });

      setCategories((prev) => [...prev, newCategory.trim()]);
      setSubCategories((prev) => ({
        ...prev,
        [newCategory.trim()]: [],
      }));
      setNewCategory("");
      toast.success(res.data.message || "Category added successfully");
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(error?.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new subcategory
  const handleAddSubCategory = async () => {
    if (!selectedCategory || !newSubCategory.trim()) {
      return toast.error("Please select a category and enter subcategory name");
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/admin/api/add-sub-category", {
        category: selectedCategory,
        subCategory: newSubCategory.trim(),
      });

      setSubCategories((prev) => ({
        ...prev,
        [selectedCategory]: [
          ...(prev[selectedCategory] || []),
          newSubCategory.trim(),
        ],
      }));
      setNewSubCategory("");
      toast.success(res.data.message || "Subcategory added successfully");
    } catch (error: any) {
      console.error("Error adding subcategory:", error);
      toast.error(
        error?.response?.data?.message || "Failed to add subcategory"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed Upload Logic (Logo & Banner)
  const handleUpload = async (type: "logo" | "banner", file: File) => {
    try {
      setUploading(true);
      const fileName = await convertFileToBase64(file);

      // choose endpoint dynamically
      const endpoint =
        type === "logo" ? "/admin/api/upload-logo" : "/admin/api/upload-banner";

      // 🟢 send same payload structure as working product image upload
      const res = await axiosInstance.post(endpoint, {
        fileName,
      });

      if (type === "logo") {
        setLogo(res.data.logo);
        toast.success("Logo uploaded successfully!");
      } else {
        setBanner(res.data.banner);
        toast.success("Banner uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-8 text-white">
      <h2 className="text-2xl font-semibold mb-2">Customization</h2>
      <BreadCrumbs title="Customization" />

      {/* ✅ Tabs */}
      <div className="flex items-center gap-6 mt-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ✅ Tab Content */}
      <div className="mt-8">
        {/* --- Categories Tab --- */}
        {activeTab === "Categories" && (
          <div className="space-y-6">
            {categories.length === 0 ? (
              <p className="text-gray-400">No categories found.</p>
            ) : (
              <div className="space-y-4">
                {categories.map((cat, idx) => (
                  <div key={idx} className="bg-gray-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2 text-lg text-blue-400">
                      {cat}
                    </p>
                    {subCategories?.[cat]?.length > 0 ? (
                      <ul className="ml-4 text-sm text-gray-300 space-y-1">
                        {subCategories[cat].map((sub, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            {sub}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="ml-4 text-xs text-gray-500 italic">
                        No subcategories
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Category */}
            <div className="pt-4 bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3 text-gray-300">
                Add New Category
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md outline-none text-sm bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={loading || !newCategory.trim()}
                  className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md disabled:bg-blue-900 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Adding..." : "Add Category"}
                </button>
              </div>
            </div>

            {/* Add Subcategory */}
            <div className="pt-4 bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3 text-gray-300">
                Add Subcategory
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-700 px-3 py-2 rounded-md outline-none text-white border border-gray-600 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Enter subcategory name"
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md outline-none text-sm bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
                />
                <button
                  onClick={handleAddSubCategory}
                  disabled={
                    loading || !selectedCategory || !newSubCategory.trim()
                  }
                  className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md disabled:bg-blue-900 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Adding..." : "Add Subcategory"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Logo Tab --- */}
        {activeTab === "Logo" && (
          <div className="space-y-4 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-300">
              Platform Logo
            </h3>
            {logo ? (
              <div className="space-y-3">
                <div className="border border-gray-600 rounded-lg p-4 bg-white inline-block">
                  <img
                    src={logo}
                    alt="Platform Logo"
                    className="max-w-[200px] max-h-[100px] object-contain"
                  />
                </div>
                <p className="text-xs text-gray-400">Current logo</p>
              </div>
            ) : (
              <p className="text-gray-400">No logo uploaded.</p>
            )}

            <div className="pt-2">
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload("logo", file);
                  }}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm inline-block transition disabled:bg-blue-900">
                  {uploading
                    ? "Uploading..."
                    : logo
                    ? "Change Logo"
                    : "Upload Logo"}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* --- Banner Tab --- */}
        {activeTab === "Banner" && (
          <div className="space-y-4 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-300">
              Platform Banner
            </h3>
            {banner ? (
              <div className="space-y-3">
                <div className="border border-gray-600 rounded-lg overflow-hidden">
                  <img
                    src={banner}
                    alt="Platform Banner"
                    className="w-full max-w-[800px] h-auto object-contain"
                  />
                </div>
                <p className="text-xs text-gray-400">Current banner</p>
              </div>
            ) : (
              <p className="text-gray-400">No banner uploaded.</p>
            )}

            <div className="pt-2">
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload("banner", file);
                  }}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm inline-block transition disabled:bg-blue-900">
                  {uploading
                    ? "Uploading..."
                    : banner
                    ? "Change Banner"
                    : "Upload Banner"}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customization;
