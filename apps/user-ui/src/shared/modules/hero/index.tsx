"use client";

import { MoveRight, Sparkles, Award, Clock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useLayout from "../../../hooks/useLayout";

const Hero = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { layout, isLoading } = useLayout();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-[#115061] via-[#0d3d4a] to-[#0a2d36] min-h-[85vh] flex items-center w-full overflow-hidden">
      {/* Large Background Watch Image */}
      <div className="absolute inset-0 flex items-center justify-end">
        <div className="relative w-full h-full md:w-[60%] flex items-center justify-center md:justify-end">
          {/* Glowing effects behind image */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-yellow-400/10 to-transparent blur-3xl"></div>
          <div className="absolute right-0 top-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute right-1/4 bottom-1/4 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>

          <Image
            src={
              layout?.banner ||
              "https://ik.imagekit.io/AkshayMicroMart/photo/hero-watch_1__1___1__1__1__1__1__1__1_.png?updatedAt=1759959982636"
            }
            alt="Luxury Watch Collection 2025"
            width={800}
            height={800}
            className="relative z-10 object-contain opacity-90 scale-110 md:scale-125 drop-shadow-[0_0_80px_rgba(250,204,21,0.3)]"
            priority
          />
        </div>

        {/* Gradient overlay to blend image with background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#115061] via-[#115061]/80 to-transparent md:via-[#115061]/50"></div>
      </div>

      {/* Decorative dots pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Floating discount badge */}
      <div className="absolute top-8 right-8 md:top-12 md:right-12 z-20 bg-gradient-to-br from-yellow-400 to-orange-500 text-black font-bold px-6 py-3 rounded-full shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-300 animate-bounce">
        <div className="text-center">
          <div className="text-3xl leading-none">10%</div>
          <div className="text-xs font-semibold">OFF</div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-20 w-full">
        <div className="md:w-[85%] w-[90%] m-auto py-12">
          {/* Left side text overlaying the image */}
          <div
            className={`md:w-[55%] lg:w-[50%] space-y-6 transition-all duration-1000 transform ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-12 opacity-0"
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-full px-5 py-2.5 shadow-lg">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="font-Roboto font-medium text-white text-sm">
                Starting from{" "}
                <span className="text-yellow-400 font-bold text-base">$50</span>
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-extrabold font-Roboto leading-tight drop-shadow-2xl">
              The Best Watch
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">
                Collection 2025
              </span>
            </h1>

            {/* Subtitle with special offer */}
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl blur opacity-40"></div>
              <div className="relative bg-[#115061]/90 backdrop-blur-md border border-white/20 px-5 py-3 rounded-xl shadow-2xl">
                <p className="font-Oregano text-2xl md:text-3xl text-white">
                  Exclusive offer{" "}
                  <span className="text-yellow-400 font-bold text-4xl">
                    10%
                  </span>{" "}
                  off this week
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  Premium Quality
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  Limited Edition
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => router.push("/products")}
                className="group relative w-[200px] h-[56px] bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/50 shadow-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Shop Now
                  <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <p className="text-white/70 text-sm mt-3 flex items-center gap-2 bg-white/5 backdrop-blur-sm w-fit px-4 py-2 rounded-full border border-white/10">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Free shipping on orders over $100
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10">
        <svg viewBox="0 0 1440 120" className="w-full h-full">
          <path
            fill="white"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
