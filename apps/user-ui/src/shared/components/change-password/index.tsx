"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../../../utils/axiosinstance";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 👁️ Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data: any) => {
    setError("");
    setMessage("");

    try {
      await axiosInstance.post("/api/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      setMessage("Password changed successfully ✅");
      reset();
    } catch (err: any) {
      setError(err?.response?.data?.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              {...register("currentPassword", {
                required: "Current password is required",
              })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              {showCurrent ? <Eye /> : <EyeOff />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              {String(errors.currentPassword.message)}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                validate: {
                  hasLower: (v) =>
                    /[a-z]/.test(v) ||
                    "Password must contain at least one lowercase letter",
                  hasUpper: (v) =>
                    /[A-Z]/.test(v) ||
                    "Password must contain at least one uppercase letter",
                  hasNumber: (v) =>
                    /\d/.test(v) || "Password must contain at least one number",
                },
              })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              {showNew ? <Eye /> : <EyeOff />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">
              {String(errors.newPassword.message)}
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (value) =>
                  value === watch("newPassword") || "Passwords do not match",
              })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              {showConfirm ? <Eye /> : <EyeOff />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {String(errors.confirmPassword.message)}
            </p>
          )}
        </div>

        {/* Feedback Messages */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
