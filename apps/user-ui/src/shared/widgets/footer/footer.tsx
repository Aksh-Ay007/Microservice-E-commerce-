"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0e1a2b] text-white mt-10">
      <div className="w-[90%] lg:w-[80%] m-auto py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
          <Link href="/">
            <Image
              src="https://ik.imagekit.io/AkshayMicroMart/photo/micromartLogo.png?updatedAt=1759960829231"
              width={150}
              height={50}
              alt="MicroMart Logo"
              className="h-[60px] object-contain mb-4"
            />
          </Link>
          <p className="text-gray-300 text-sm leading-relaxed">
            MicroMart is your one-stop online marketplace, offering the best
            deals on electronics, fashion, and more — with trust and
            convenience.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3 mt-4">
            <Link
              href="#"
              className="p-2 bg-white/10 rounded-full hover:bg-[#3489FF] transition-colors"
            >
              <Facebook size={18} />
            </Link>
            <Link
              href="#"
              className="p-2 bg-white/10 rounded-full hover:bg-[#3489FF] transition-colors"
            >
              <Instagram size={18} />
            </Link>
            <Link
              href="#"
              className="p-2 bg-white/10 rounded-full hover:bg-[#3489FF] transition-colors"
            >
              <Twitter size={18} />
            </Link>
            <Link
              href="#"
              className="p-2 bg-white/10 rounded-full hover:bg-[#3489FF] transition-colors"
            >
              <Youtube size={18} />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
            Quick Links
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <Link
                href="/about"
                className="hover:text-[#3489FF] transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/offers"
                className="hover:text-[#3489FF] transition-colors"
              >
                Latest Offers
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-[#3489FF] transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="hover:text-[#3489FF] transition-colors"
              >
                FAQs
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
            Customer Support
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-[#3489FF] transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-[#3489FF] transition-colors"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/returns"
                className="hover:text-[#3489FF] transition-colors"
              >
                Return Policy
              </Link>
            </li>
            <li>
              <Link
                href="/shipping"
                className="hover:text-[#3489FF] transition-colors"
              >
                Shipping Info
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
            Contact Us
          </h3>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} /> support@micromart.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +971 52 123 4567
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-1" /> Dubai, United Arab Emirates
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-4 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} MicroMart. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
