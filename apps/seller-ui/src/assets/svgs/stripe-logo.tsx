import * as React from "react";

const StripeLogo = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28.87 28.87"
    width={25}
    height={25}
    id="stripe"
    {...props}
  >
    <g id="Layer_2">
      <g id="Layer_1-2">
        <rect
          width={28.87}
          height={28.87}
          rx={6.48}
          ry={6.48}
          style={{
            fill: "#6772e5",
          }}
        />
        <path
          d="M13.3 11.2c0-.69.57-1 1.49-1a9.84 9.84 0 0 1 4.37 1.13V7.24a11.6 11.6 0 0 0-4.52-.87c-3.77 0-6.26 1.97-6.26 5.26 0 5.15 7.09 4.34 7.09 6.58 0 .77-.65 1.09-1.57 1.09a10.5 10.5 0 0 1-4.7-1.36v4.14a11.4 11.4 0 0 0 4.84 1c3.94 0 6.49-1.95 6.49-5.27-.01-5.54-7.09-4.56-7.09-6.61Z"
          style={{
            fill: "#fff",
            fillRule: "evenodd",
          }}
        />
      </g>
    </g>
  </svg>
);

export default StripeLogo;
