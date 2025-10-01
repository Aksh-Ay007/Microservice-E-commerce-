import React from "react";

const WishlistIcon = ({ className = "w-6 h-6 text-gray-700" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="Wishlist"
  >
    <path d="M20.8 4.6c-1.5-1.4-4-1.4-5.5 0L12 7.9 8.7 4.6C7.2 3.2 4.7 3.2 3.2 4.6s-1.5 3.8 0 5.3l8.3 8.4 8.3-8.4c1.5-1.5 1.5-3.9 0-5.3z" />
  </svg>
);

export default WishlistIcon;
