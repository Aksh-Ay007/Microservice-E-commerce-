"use client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/seller/api/login-seller`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      router.push("/dashboard");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid Credentials";
      setServerError(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 min-h-screen bg-gray-950 text-white">
      <div className="text-center mb-4">
        <span
          className="px-3 py-1 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow"
        >
          Seller Portal
        </span>
      </div>
      <h1 className="text-4xl font-Poppins font-semibold text-white text-center">
        Seller Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-gray-400">
        Access your MicroMart Seller Dashboard
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-gray-900 border border-gray-800 shadow-lg rounded-xl">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Login to MicroMart
          </h3>
          <p className="text-center text-gray-400 mb-4">
            Don't have an account?{" "}
            <Link href={"/signup"} className="text-cyan-400 hover:underline">
              Sign up
            </Link>
          </p>

          <div className="flex items-center my-5 text-gray-500 text-sm">
            <div className="flex-1 border-t border-gray-700" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="support@micromart.com"
              className="w-full p-3 border border-gray-700 bg-transparent text-white rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         outline-none transition"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}

            {/* Password */}
            <label className="block text-gray-300 mb-1 mt-3">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Min 6 characters"
                className="w-full p-3 border border-gray-700 bg-transparent text-white rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           outline-none transition"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              >
                {passwordVisible ? <Eye /> : <EyeOff />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}

            {/* Remember + Forgot */}
            <div className="flex justify-between items-center my-4">
              <label className="flex items-center text-gray-400">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember Me
              </label>
              <Link
                href={"/forgot-password"}
                className="text-cyan-400 text-sm hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-lg font-medium cursor-pointer
                         bg-gradient-to-r from-blue-600 to-indigo-700
                         hover:from-blue-600 hover:to-indigo-700
                         text-white py-2.5 rounded-xl shadow-md
                         hover:shadow-lg transition-all"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
            {serverError && (
              <p className="text-red-400 text-sm mt-2">{serverError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
