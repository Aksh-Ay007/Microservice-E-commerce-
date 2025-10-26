"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Users, DollarSign, ShoppingBag } from "lucide-react";

const LandingPage = () => {
  const benefits = [
    "No setup fees or monthly charges",
    "Keep up to 95% of your sales",
    "24/7 customer support",
    "Advanced analytics and insights",
  ];

  const stats = [
    { number: "50K+", label: "Active Sellers", icon: <Users /> },
    { number: "$2M+", label: "Monthly Sales", icon: <DollarSign /> },
    { number: "99.9%", label: "Uptime", icon: <Zap /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                MicroMart
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-slate-900/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-800/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Join 50,000+ sellers worldwide</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Start Selling in
              <br />
              <span className="text-blue-600">
                Minutes, Not Months
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The fastest way to build, launch, and scale your online store. 
              All the tools you need, all in one place.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-xl flex items-center gap-2 font-semibold"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors font-semibold"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-600/50 transition-colors"
                >
                  <div className="text-blue-500 mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Why Choose MicroMart?
            </h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/50 transition-colors border border-slate-800"
                >
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-lg text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center bg-slate-900 border border-slate-800 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-xl text-slate-400 mb-8">
              Join thousands of successful sellers on MicroMart
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xl font-semibold"
            >
              Start Selling Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-slate-400">© 2024 MicroMart. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-slate-400">
              <Link href="/login" className="hover:text-white transition">
                Login
              </Link>
              <Link href="/signup" className="hover:text-white transition">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
