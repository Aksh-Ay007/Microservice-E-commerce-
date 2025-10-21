"use client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { countries } from "../../../utils/countries";
import CreateShop from '../../../shared/modules/auth/create-shop';
import StripeLogo from '../../../assets/svgs/stripe-logo';

const SignUp = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const [sellerId, setSellerId]=useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/seller/api/seller-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const varifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) {
        return;
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/seller/api/verify-seller`,
        { ...sellerData, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: (data) => {

        setSellerId(data?.seller?.id)
        setActiveStep(2)
    },
  });

  const onSubmit = (data: any) => {
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) {return}
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
  };

  const connectStripe=async()=>{

    try {

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/seller/api/create-stripe-link`,
        {sellerId}
      );

      if(response.data.url){

        window.location.href = response.data.url;
      }

    } catch (error) {

      console.log('stripe connection error',error)

    }
  }

  return (
    <div className="w-full flex flex-col items-center pt-6 sm:pt-10 min-h-screen bg-[#0F1117] px-4">
      {/* Stepper*/}
      <div className="relative flex items-center justify-between w-full max-w-md sm:max-w-lg lg:max-w-xl mb-8">
        <div className="absolute top-[25%] left-0 w-[80%] sm:w-[85%] lg:w-[90%] h-1 bg-gray-600 -z-10" />

        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white font-bold text-sm sm:text-base ${
                step <= activeStep ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              {step}
            </div>
            <span className="text-xs sm:text-sm text-gray-300 mt-2 text-center max-w-[80px]">
              {step === 1
                ? "Create Account"
                : step === 2
                ? "Setup Shop"
                : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>

      {/* step content*/}
      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 bg-gray-900 border border-gray-700 shadow-lg rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-xl sm:text-2xl font-semibold text-center mb-4 text-white">
                  Create Seller Account
                </h3>
                {/* Name */}
                <label className="block text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Akshay"
                  className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-lg
                           focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                           outline-none transition placeholder-gray-500"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">
                    {String(errors.name.message)}
                  </p>
                )}

                {/* Email */}
                <label className="block text-gray-300 mb-1 mt-3">Email</label>
                <input
                  type="email"
                  placeholder="support@micromart.com"
                  className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-lg
                           focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                           outline-none transition placeholder-gray-500"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{String(errors.email.message)}</p>
                )}

                {/* Phone Number */}
                <label className="block text-gray-300 mb-1 mt-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="828193****"
                  className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-lg
                           focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                           outline-none transition placeholder-gray-500"
                  {...register("phone_number", {
                    required: "Phone Number is required",
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: "Invalid phone number format",
                    },
                    minLength: {
                      value: 10,
                      message: "Phone number must be at least 10 digits",
                    },
                  })}
                />

                {errors.phone_number && (
                  <p className="text-red-400 text-sm mt-1">
                    {String(errors.phone_number.message)}
                  </p>
                )}

                {/* Country */}
                <label className="block text-gray-300 mb-1 mt-3">Country</label>
                <select
                  className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  {...register("country", {
                    required: "Country is required",
                  })}
                >
                  <option value="" className="bg-gray-800">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code} className="bg-gray-800">
                      {country.name}
                    </option>
                  ))}
                </select>

                {errors.country && (
                  <p className="text-red-400 text-sm mt-1">
                    {String(errors.country.message)}
                  </p>
                )}

                {/* Password */}
                <label className="block text-gray-300 mb-1 mt-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Min 6 characters"
                    className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-lg
                             focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                             outline-none transition placeholder-gray-500"
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
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-300"
                  >
                    {passwordVisible ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {String(errors.password.message)}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="mt-5 w-full text-lg font-medium cursor-pointer
                           bg-gradient-to-r from-blue-500 to-indigo-600
                           hover:from-blue-600 hover:to-indigo-700
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-white py-2.5 rounded-xl shadow-md
                           hover:shadow-lg transition-all"
                >
                  {signupMutation.isPending ? "Signing Up..." : "Sign Up"}
                </button>
                {signupMutation.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-400 text-sm mt-2">
                      {signupMutation.error.response?.data?.message ||
                        signupMutation.error.message}
                    </p>
                  )}
                <p className="pt-3 text-center text-gray-400">
                  Already have an account? <Link href={"/login"} className="text-cyan-400 hover:underline">Login</Link>
                </p>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-center mb-4 text-white">
                  Enter OTP
                </h3>
                <div className="flex justify-center gap-2 sm:gap-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      ref={(el) => {
                        if (el) {
                          inputRefs.current[index] = el;
                        }
                      }}
                      maxLength={1}
                      className="w-10 h-10 sm:w-12 sm:h-12 text-center bg-gray-800 border border-gray-600 text-white rounded-lg
                               focus:ring-2 focus:ring-blue-400 outline-none text-lg"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>
                <button
                  className="w-full mt-5 text-lg font-medium cursor-pointer
                           bg-gradient-to-r from-blue-500 to-indigo-600
                           hover:from-blue-600 hover:to-indigo-700
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-white py-2.5 rounded-xl shadow-md
                           hover:shadow-lg transition-all"
                  disabled={varifyOtpMutation.isPending}
                  onClick={() => varifyOtpMutation.mutate()}
                >
                  {varifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                </button>
                <p className="text-center text-sm mt-4 text-gray-400">
                  {canResend ? (
                    <button
                      onClick={resendOtp}
                      className="text-cyan-400 hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer}s`
                  )}
                </p>
                {varifyOtpMutation?.isError &&
                  varifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-400 text-sm mt-2">
                      {varifyOtpMutation.error.response?.data?.message ||
                        varifyOtpMutation.error.message}
                    </p>
                  )}
              </div>
            )}
          </>
        )}
        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
        {activeStep === 3 && (
             <div className='text-center'>
              <h3 className='text-xl sm:text-2xl font-semibold text-white'>Withdraw Method</h3>
              <br />
              <button className='w-full m-auto flex items-center justify-center gap-3 text-base sm:text-lg bg-[#334155] hover:bg-[#475569] text-white py-3 rounded-lg transition-colors'
              onClick={connectStripe}>
                Connect Stripe <StripeLogo/>
              </button>
             </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
