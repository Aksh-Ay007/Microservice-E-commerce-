import React from "react";

const ProfileIcon = ({ className = "w-6 h-6 text-gray-700" }) => (
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
    aria-label="User profile"
  >
    <circle cx="12" cy="8" r="3.2" /> {/* head */}
    <path d="M4.5 20c1.6-3.8 4.8-5.6 7.5-5.6s5.9 1.8 7.5 5.6" />{" "}
    {/* shoulders/body */}
  </svg>
);

export default ProfileIcon;
