import React from "react";

interface LogoProps {
  size?: number;
  fill?: string;
}

const Logo = ({ size = 40, fill = "#0085ff" }: LogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rounded square outline */}
      <rect
        x="4"
        y="4"
        width="48"
        height="48"
        rx="10"
        fill="none"
        stroke={fill}
        strokeWidth="2"
      />

      {/* Inner lines */}
      <path
        d="M18 22H38"
        stroke={fill}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M18 28H32"
        stroke={fill}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M18 34H28"
        stroke={fill}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Logo;
