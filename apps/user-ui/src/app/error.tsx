"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-800">Something went wrong</h2>
      <p className="text-gray-600 mt-2">
        {error?.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
