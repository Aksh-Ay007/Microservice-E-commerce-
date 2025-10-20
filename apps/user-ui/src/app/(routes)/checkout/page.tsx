"use client";

import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosinstance";
import CheckoutForm from "../../../shared/components/checkout/checkoutForm";

// ✅ Load Stripe once
// ✅ Improved: Add validation for Stripe key
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;



const Page = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [coupon, setCoupon] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("sessionId");

  useEffect(() => {
    const fetchSessionAndClientSecret = async () => {

      if (!sessionId) {
        console.error("[ERROR] No sessionId provided in URL");
        setError("No session ID provided");
        setLoading(false);
        return;
      }

      try {
        // 🟢 STEP 1: Verify session
        const verifyRes = await axiosInstance.get(
          `/order/api/verifying-payment-session?sessionId=${sessionId}`
        );

        const session = verifyRes.data?.session;
        if (!session) {
          throw new Error("Invalid response: session not found");
        }

        const { totalAmount, sellers, cart, coupon } = session;


        if (
          !sellers ||
          sellers.length === 0 ||
          totalAmount === undefined ||
          totalAmount === null
        ) {
          throw new Error("Invalid payment session data");
        }

        setCartItems(cart);
        setCoupon(coupon);

        // 🟢 STEP 2: Create Payment Intent
        const sellerStripeAccountId = sellers[0]?.stripeAccountId;


        const amountToCharge =
          coupon?.discountAmount && coupon?.discountAmount < totalAmount
            ? totalAmount - coupon.discountAmount
            : totalAmount;


        const intentRes = await axiosInstance.post(
          "/order/api/create-payment-intent",
          {
            amount: amountToCharge,
            sellerStripeAccountId,
            sessionId,
          }
        );


        if (!intentRes.data?.clientSecret) {
          throw new Error("Missing clientSecret in response");
        }

        setClientSecret(intentRes.data.clientSecret);
      } catch (err: any) {
        console.error("[ERROR] Fetching session or creating intent:", err);
        setError(
          "An error occurred while preparing the payment. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndClientSecret();
  }, [sessionId]);

  // Stripe appearance setup
  const appearance: Appearance = {
    theme: "stripe",
  };

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="w-full text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Payment failed
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {error}
            <br className="hidden sm:block" />
            Please try again or contact support if the issue persists.
          </p>
          <button
            onClick={() => router.push("/cart")}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  // ✅ Improved: Add null check for stripePromise
  if (!stripePromise) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="w-full text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Configuration Error
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Payment system is not properly configured. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Render checkout form when ready
  return (
    clientSecret && (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm
          clientSecret={clientSecret}
          cartItems={cartItems}
          coupon={coupon}
          sessionId={sessionId}
        />
      </Elements>
    )
  );
};

export default Page;
