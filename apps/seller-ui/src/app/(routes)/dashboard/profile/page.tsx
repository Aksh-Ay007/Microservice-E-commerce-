"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle,
  Edit3,
  Loader2,
  Save,
  Star,
  Trash2,
  Upload,
  User,
  X,
  XCircle,
  Award,
  DollarSign,
  CreditCard,
  Shield,
  Mail,
  Calendar,
  Image as ImageIcon,
  MapPin,
  Clock,
  Globe,
  Building,
  Phone,
  Flag,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../utils/axiosinstance";

const SellerProfilePage = () => {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [isDeletingBanner, setIsDeletingBanner] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    country: "",
    bio: "",
    address: "",
    opening_hours: "",
    website: "",
    category: "",
  });

  const queryClient = useQueryClient();

  // Fetch seller data
  const { data: seller, isLoading } = useQuery({
    queryKey: ["seller"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/api/logged-in-seller");
      return res.data.seller;
    },
  });

  // Initialize edit form when seller data loads
  useEffect(() => {
    if (seller) {
      setEditForm({
        name: seller.name || "",
        email: seller.email || "",
        phone_number: seller.phone_number || "",
        country: seller.country || "",
        bio: seller.shop?.bio || "",
        address: seller.shop?.address || "",
        opening_hours: seller.shop?.opening_hours || "",
        website: seller.shop?.website || "",
        category: seller.shop?.category || "",
      });
    }
  }, [seller]);

  // Smart image compression function
  const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = Math.round(img.width * ratio);
        const newHeight = Math.round(img.height * ratio);

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        const tryCompress = (q: number) => {
          canvas.toBlob((blob) => {
            if (blob) {
              if (blob.size > 2 * 1024 * 1024 && q > 0.3) {
                tryCompress(q - 0.1);
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', q);
        };

        tryCompress(quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Base64 conversion function
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle avatar file selection
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image size must be less than 50MB. Please choose a smaller image.");
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setSelectedAvatarFile(file);

      setCompressionInfo(`Processing ${formatFileSize(file.size)}...`);

      const compressedFile = await compressImage(file, 400, 0.85);
      setSelectedAvatarFile(compressedFile);

      const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100);
      setCompressionInfo(
        `Compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)} (${compressionRatio}% smaller)`
      );

      if (compressionRatio > 50) {
        toast.success(`Image optimized! Reduced by ${compressionRatio}%`);
      } else if (compressionRatio > 20) {
        toast.success(`Image compressed by ${compressionRatio}%`);
      }

    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Error processing image. Please try again.");
    }
  };

  // Handle banner file selection
  const handleBannerFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image size must be less than 50MB. Please choose a smaller image.");
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
      setSelectedBannerFile(file);

      setCompressionInfo(`Processing ${formatFileSize(file.size)}...`);

      const compressedFile = await compressImage(file, 800, 0.85);
      setSelectedBannerFile(compressedFile);

      const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100);
      setCompressionInfo(
        `Compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)} (${compressionRatio}% smaller)`
      );

      if (compressionRatio > 50) {
        toast.success(`Image optimized! Reduced by ${compressionRatio}%`);
      } else if (compressionRatio > 20) {
        toast.success(`Image compressed by ${compressionRatio}%`);
      }

    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Error processing image. Please try again.");
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile) return;

    if (isUploadingAvatar) {
      console.log("⚠️ Upload already in progress, ignoring...");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileName = await convertFileToBase64(selectedAvatarFile);
      const response = await axiosInstance.post("/seller/api/update-avatar", {
        fileName: fileName,
      });

      toast.success("Avatar updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["seller"] });

      setAvatarPreview(null);
      setSelectedAvatarFile(null);
      setCompressionInfo(null);

      const fileInput = document.getElementById("avatarUpload") as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error("❌ Upload error:", error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          "Upload failed";
      toast.error(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle banner upload
  const handleBannerUpload = async () => {
    if (!selectedBannerFile) return;

    if (isUploadingBanner) {
      console.log("⚠️ Upload already in progress, ignoring...");
      return;
    }

    setIsUploadingBanner(true);

    try {
      const fileName = await convertFileToBase64(selectedBannerFile);
      const response = await axiosInstance.post("/seller/api/update-banner", {
        fileName: fileName,
      });

      toast.success("Banner updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["seller"] });

      setBannerPreview(null);
      setSelectedBannerFile(null);
      setCompressionInfo(null);

      const fileInput = document.getElementById("bannerUpload") as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error("❌ Upload error:", error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          "Upload failed";
      toast.error(errorMessage);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Handle avatar deletion
  const handleAvatarDelete = async () => {
    if (isDeletingAvatar) return;

    setIsDeletingAvatar(true);

    try {
      await axiosInstance.delete("/seller/api/delete-avatar");
      toast.success("Avatar deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["seller"] });
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          "Delete failed";
      toast.error(errorMessage);
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  // Handle banner deletion
  const handleBannerDelete = async () => {
    if (isDeletingBanner) return;

    setIsDeletingBanner(true);

    try {
      await axiosInstance.delete("/seller/api/delete-banner");
      toast.success("Banner deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["seller"] });
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          "Delete failed";
      toast.error(errorMessage);
    } finally {
      setIsDeletingBanner(false);
    }
  };

  // Cancel uploads
  const cancelAvatarUpload = () => {
    setAvatarPreview(null);
    setSelectedAvatarFile(null);
    setCompressionInfo(null);
    const fileInput = document.getElementById("avatarUpload") as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const cancelBannerUpload = () => {
    setBannerPreview(null);
    setSelectedBannerFile(null);
    setCompressionInfo(null);
    const fileInput = document.getElementById("bannerUpload") as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Get current avatar URL
  const getCurrentAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (seller?.shop?.avatar?.url) return seller.shop.avatar.url;
    return null;
  };

  // Get current banner URL
  const getCurrentBannerUrl = () => {
    if (bannerPreview) return bannerPreview;
    if (seller?.shop?.coverBanner?.url) return seller.shop.coverBanner.url;
    return null;
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      const response = await axiosInstance.put("/seller/api/update-profile", editForm);
      toast.success("Profile updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["seller"] });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditForm({
      name: seller?.name || "",
      email: seller?.email || "",
      phone_number: seller?.phone_number || "",
      country: seller?.country || "",
      bio: seller?.shop?.bio || "",
      address: seller?.shop?.address || "",
      opening_hours: seller?.shop?.opening_hours || "",
      website: seller?.shop?.website || "",
      category: seller?.shop?.category || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Banner Section */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
          {getCurrentBannerUrl() ? (
            <img
              src={getCurrentBannerUrl()!}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <ImageIcon className="w-16 h-16 opacity-50" />
            </div>
          )}
        </div>

        {/* Banner Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() =>
              document.getElementById("bannerUpload")?.click()
            }
            disabled={isUploadingBanner}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg px-4 py-2 flex items-center gap-2 disabled:opacity-50 transition-all duration-200"
          >
            {isUploadingBanner ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {bannerPreview ? "Update" : "Add Banner"}
          </button>

          {getCurrentBannerUrl() && (
            <button
              onClick={handleBannerDelete}
              disabled={isDeletingBanner}
              className="bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg px-4 py-2 flex items-center gap-2 disabled:opacity-50 transition-all duration-200"
            >
              {isDeletingBanner ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          )}
        </div>

        {/* Hidden Banner File Input */}
        <input
          type="file"
          id="bannerUpload"
          accept="image/*"
          onChange={handleBannerFileSelect}
          className="hidden"
        />
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4 -mt-16 relative z-10">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 shadow-lg border-4 border-white">
            {getCurrentAvatarUrl() ? (
              <img
                src={getCurrentAvatarUrl()!}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <User className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Avatar Actions */}
          <div className="absolute -bottom-2 -right-2 flex gap-2">
            <button
              onClick={() =>
                document.getElementById("avatarUpload")?.click()
              }
              disabled={isUploadingAvatar}
              className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:opacity-50 shadow-lg transition-all duration-200 hover:scale-105"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>

            {getCurrentAvatarUrl() && (
              <button
                onClick={handleAvatarDelete}
                disabled={isDeletingAvatar}
                className="bg-red-500 text-white rounded-full p-3 hover:bg-red-600 disabled:opacity-50 shadow-lg transition-all duration-200 hover:scale-105"
              >
                {isDeletingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* Hidden Avatar File Input */}
          <input
            type="file"
            id="avatarUpload"
            accept="image/*"
            onChange={handleAvatarFileSelect}
            className="hidden"
          />
        </div>

        {/* Compression Info */}
        {compressionInfo && (
          <div className="text-center">
            <p className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              {compressionInfo}
            </p>
          </div>
        )}

        {/* Upload Actions */}
        {(avatarPreview || bannerPreview) && (
          <div className="flex gap-3">
            {avatarPreview && (
              <button
                onClick={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
              </button>
            )}
            {bannerPreview && (
              <button
                onClick={handleBannerUpload}
                disabled={isUploadingBanner}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {isUploadingBanner ? "Uploading..." : "Upload Banner"}
              </button>
            )}
            <button
              onClick={() => {
                cancelAvatarUpload();
                cancelBannerUpload();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}

        {/* Upload Instructions */}
        {!avatarPreview && !bannerPreview && (
          <div className="text-center max-w-xs">
            <p className="text-sm text-gray-500 mb-2">
              Click the camera icons to upload avatar and banner
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>✅ Supports: JPEG, PNG, GIF, WebP</p>
              <p>✅ Max size: 50MB (auto-compressed)</p>
              <p>✅ Optimized for web display</p>
            </div>
          </div>
        )}
      </div>

      {/* Shop Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Shop Information</h3>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Shop Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Country
                </label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={editForm.opening_hours}
                  onChange={(e) => setEditForm({...editForm, opening_hours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Category
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your shop..."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleProfileUpdate}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Shop Name
              </label>
              <p className="text-gray-800">{seller?.name}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <p className="text-gray-800">{seller?.email}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <p className="text-gray-800">{seller?.phone_number || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Country
              </label>
              <p className="text-gray-800">{seller?.country || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              <p className="text-gray-800">{seller?.shop?.address || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Opening Hours
              </label>
              <p className="text-gray-800">{seller?.shop?.opening_hours || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <p className="text-gray-800">{seller?.shop?.website || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <p className="text-gray-800">{seller?.shop?.category || "Not provided"}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Bio
              </label>
              <p className="text-gray-800">{seller?.shop?.bio || "No bio provided"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </label>
              <p className="text-gray-800">
                {new Date(seller?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Account Status
              </label>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfilePage;
