// apps/user-ui/src/assets/svgs/youtube-icon.tsx

import React from "react";

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="24" // Default width
    height="24" // Default height
    fill="#FF0000" // Default YouTube red color
    {...props}
  >
    <title>YouTube Logo</title>
    <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.022.26-.01.104c-.048.519-.119 1.023-.22 1.402a2.01 2.01 0 0 1-1.415 1.42c-1.123.302-5.29.332-6.11.335h-.088c-.823-.003-4.988-.033-6.11-.335a2.01 2.01 0 0 1-1.415-1.42c-.1-.38-.172-.884-.22-1.402l-.01-.104-.022-.26-.008-.104C.01 9.471 0 8.614 0 8.427v-.075c.001-.194.01-1.108.082-2.06l.008-.105.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c1.123-.302 5.289-.332 6.11-.335ZM8 12.353V4.286l4.032 4.033L8 12.353Z" />
  </svg>
);

export default YoutubeIcon;
