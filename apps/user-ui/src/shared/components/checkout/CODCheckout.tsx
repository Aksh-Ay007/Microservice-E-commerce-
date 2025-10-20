"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, Shield, Clock } from "lucide-react";
import axiosInstance from "../../../utils/axiosinstance";
import toast from "react-hot-toast";

interface CODCheckoutProps {
  cart: any[];
  selectedAddressId: string;
  coupon?: any;
  onSuccess: (orders: any[]) => void;
  onError: (error: string) => void;
}

const CODCheckout = ({ cart, selectedAddressId, coupon, onSuccess, onError }: CODCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();

  const handleCODOrder = async () => {
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    try {
      setLoading(true);
      
      const response = await axiosInstance.post("/order/api/create-cod-order", {
        cart,
        selectedAddressId,
        coupon,
      });

      if (response.data.success) {
        toast.success("COD order placed successfully!");
        onSuccess(response.data.orders);
        
        // Redirect to order confirmation page
        router.push(`/order-confirmation?type=cod&orders=${response.data.orders.map((o: any) => o.id).join(',')}`);
      }
    } catch (error: any) {
      console.error("COD order error:", error);
      const errorMessage = error?.response?.data?.message || "Failed to place COD order";
      toast.error(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
  const discountAmount = coupon?.discountAmount || 0;
  const finalAmount = totalAmount - discountAmount;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Truck className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Cash on Delivery</h3>
          <p className="text-sm text-gray-600">Pay when your order arrives</p>
        </div>
      </div>

      {/* COD Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Secure Payment</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Clock className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium text-gray-700">No Prepayment</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Truck className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Easy Returns</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t pt-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span className="text-green-600">FREE</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* COD Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h5 className="font-medium text-blue-900 mb-2">How Cash on Delivery Works:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Place your order without any upfront payment</li>
          <li>• Pay the delivery person when your order arrives</li>
          <li>• You can inspect the items before payment</li>
          <li>• Cash, card, or digital payment accepted on delivery</li>
        </ul>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-6">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            . I understand that I will pay for this order upon delivery.
          </span>
        </label>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handleCODOrder}
        disabled={loading || !acceptedTerms}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Placing Order...
          </>
        ) : (
          <>
            <Truck className="w-5 h-5" />
            Place COD Order (${finalAmount.toFixed(2)})
          </>
        )}
      </button>

      {/* Alternative Payment Option */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Prefer to pay now?{" "}
          <button
            onClick={() => {
              // This would switch to card payment
              window.location.href = "/checkout?payment=card";
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            Use Card Payment
          </button>
        </p>
      </div>
    </div>
  );
};

export default CODCheckout;
