"use client";

import confetti from "canvas-confetti";
import { CheckCircle, Truck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "../../../store";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const router = useRouter();

  useEffect(() => {
    useStore.setState({ cart: [] });

    // Trigger confetti animation

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center  px-4">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg max-w-md w-full p-6 text-center">
        <div className="text-green-500 mb-4">
          <CheckCircle className="w-16 h-16 mx-auto" />
        </div>

        <h2 className="text-2xl font-semibold mb-2 text-gray-800">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6 text-sm ">
          Thank you for your purchase. Your transaction has been completed
          successfully.
        </p>

        <button
          onClick={() => router.push(`/profile?active=My+Orders`)}
          className=" inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Truck className="w-4 h-4" />
          Track Order
        </button>

        <div className='mt-8 text-xs text-gray-400'>

         Payment Session ID: <span className=' font-mono'>{sessionId}</span>


        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;


