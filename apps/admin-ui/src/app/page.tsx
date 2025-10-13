"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../../packages/components/input";

type LoginFormData = {
  email: string;
  password: string;
};

type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const AdminAuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    watch,
    formState: { errors: signupErrors },
    reset,
  } = useForm<SignupFormData>();

  const password = watch("password");

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-admin`,
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
        (error.response?.data as { message: string })?.message ||
        "Invalid Credentials";
      setServerError(errorMessage);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/signup-admin`,
        {
          name: data.name,
          email: data.email,
          password: data.password,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      setSuccessMessage("Admin created successfully! You can now login.");
      reset();
      setTimeout(() => {
        setIsSignup(false);
        setSuccessMessage(null);
      }, 2000);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        "Failed to create admin";
      setServerError(errorMessage);
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setServerError(null);
    loginMutation.mutate(data);
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      setServerError("Passwords do not match");
      return;
    }
    setServerError(null);
    signupMutation.mutate(data);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setServerError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-900">
      <div className="md:w-[450px] w-full mx-4 pb-8 bg-slate-800 rounded-md shadow-lg">
        {!isSignup ? (
          // Login Form
          <form className="p-5" onSubmit={handleSubmitLogin(onLoginSubmit)}>
            <h1 className="text-3xl pb-3 pt-4 font-semibold text-center text-white font-Poppins">
              Welcome Admin
            </h1>

            <div className="mt-4">
              <Input
                label="Email"
                placeholder="admin@example.com"
                {...registerLogin("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {loginErrors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            <div className="mt-3">
              <Input
                label="Password"
                type="password"
                placeholder="********"
                {...registerLogin("password", {
                  required: "Password is required",
                })}
              />
              {loginErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {loginErrors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full mt-5 text-xl flex justify-center font-semibold font-Poppins cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <div className="h-6 w-6 border-2 border-gray-100 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Login</>
              )}
            </button>

            {serverError && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {serverError}
              </p>
            )}

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Need to create admin? Setup here
              </button>
            </div>
          </form>
        ) : (
          // Signup Form
          <form className="p-5" onSubmit={handleSubmitSignup(onSignupSubmit)}>
            <h1 className="text-3xl pb-3 pt-4 font-semibold text-center text-white font-Poppins">
              Create Admin
            </h1>
            <p className="text-center text-gray-400 text-sm mb-4">
              Set up the administrator account
            </p>

            <div className="mt-4">
              <Input
                label="Name"
                placeholder="Admin Name"
                {...registerSignup("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
              {signupErrors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {signupErrors.name.message}
                </p>
              )}
            </div>

            <div className="mt-3">
              <Input
                label="Email"
                placeholder="admin@example.com"
                {...registerSignup("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {signupErrors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {signupErrors.email.message}
                </p>
              )}
            </div>

            <div className="mt-3">
              <Input
                label="Password"
                type="password"
                placeholder="********"
                {...registerSignup("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {signupErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {signupErrors.password.message}
                </p>
              )}
            </div>

            <div className="mt-3">
              <Input
                label="Confirm Password"
                type="password"
                placeholder="********"
                {...registerSignup("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              {signupErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {signupErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full mt-5 text-xl flex justify-center font-semibold font-Poppins cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signupMutation.isPending ? (
                <div className="h-6 w-6 border-2 border-gray-100 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Create Admin</>
              )}
            </button>

            {serverError && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {serverError}
              </p>
            )}
            {successMessage && (
              <p className="text-green-500 text-sm mt-2 text-center">
                {successMessage}
              </p>
            )}

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Already have an admin account? Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminAuthPage;
