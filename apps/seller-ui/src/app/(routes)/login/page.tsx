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
    <div className="w-full py-10 min-h-screen bg-slate-950">
      <div className="text-center mb-4">
        <span
          className="px-3 py-1 text-sm font-semibold text-white
          bg-blue-600 rounded-full shadow-lg"
        >
          Seller Portal
        </span>
      </div>
      <h1 className="text-4xl font-Poppins font-semibold text-white text-center">
        Seller Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-slate-400">
        Access your MicroMart Seller Dashboard
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-slate-900 border border-slate-800 shadow-lg rounded-xl">
          <h3 className="text-3xl font-semibold text-center mb-2 text-white">
            Login to MicroMart
          </h3>
          <p className="text-center text-slate-400 mb-4">
            Don't have an account?{" "}
            <Link href={"/signup"} className="text-blue-500 hover:text-blue-400 transition hover:underline">
              Sign up
            </Link>
          </p>

          <div className="flex items-center my-5 text-slate-500 text-sm">
            <div className="flex-1 border-t border-slate-700" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-slate-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <label className="block text-slate-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="support@micromart.com"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         outline-none transition placeholder:text-slate-500"
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
            <label className="block text-slate-300 mb-1 mt-3">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Min 6 characters"
                className="w-full p-3 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           outline-none transition placeholder:text-slate-500"
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
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-300"
              >
                {passwordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}

            {/* Remember + Forgot */}
            <div className="flex justify-between items-center my-4">
              <label className="flex items-center text-slate-400">
                <input
                  type="checkbox"
                  className="mr-2 accent-blue-500"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember Me
              </label>
              <Link
                href={"/forgot-password"}
                className="text-blue-500 text-sm hover:text-blue-400 transition hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-lg font-medium cursor-pointer
                         bg-blue-600 hover:bg-blue-700
                         text-white py-2.5 rounded-xl shadow-lg
                         hover:shadow-xl transition-all disabled:opacity-50
                         disabled:cursor-not-allowed"
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
