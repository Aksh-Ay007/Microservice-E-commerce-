"use client";

import { XCircle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

/**
 * Improved error fallback component with better UX
 */
export default function ErrorFallback({
  error,
  resetError,
  title = "Oops! Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
}: ErrorFallbackProps) {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <XCircle className="w-20 h-20 text-red-500" />
            <div className="absolute inset-0 animate-ping">
              <XCircle className="w-20 h-20 text-red-300 opacity-75" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">{title}</h1>
        <p className="text-gray-600 mb-2">{message}</p>

        {error && process.env.NODE_ENV === "development" && (
          <details className="mt-4 mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          {resetError && (
            <button
              onClick={resetError}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          If this problem persists,{" "}
          <a href="/support" className="text-blue-600 hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
