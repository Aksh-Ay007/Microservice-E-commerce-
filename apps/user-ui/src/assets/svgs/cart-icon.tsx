import React from "react";

const CartIcon = ({ className = "w-6 h-6 text-gray-700" }) => (
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
    aria-label="Shopping cart"
  >
    <circle cx="9" cy="21" r="1.5" /> {/* Left wheel */}
    <circle cx="19" cy="21" r="1.5" /> {/* Right wheel */}
    <path d="M1 1h3l3.6 10.4a1.5 1.5 0 0 0 1.4 1h9.7a1.5 1.5 0 0 0 1.4-1l1.9-6H6" />
  </svg>
);

export default CartIcon;
