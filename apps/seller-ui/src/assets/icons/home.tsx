import React from "react";

const Home = ({ fill }: { fill: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="nextui-c-PJLV nextui-c-PJLV-ibxboXQ-css"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM13 13H19C19.55 13 20 12.55 20 12V4C20 3.45 19.55 3 19 3H13C12.45 3 12 3.45 12 4V12C12 12.55 12.45 13 13 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM13 21H19C19.55 21 20 20.55 20 20V16C20 15.45 19.55 15 19 15H13C12.45 15 12 15.45 12 16V20C12 20.55 12.45 21 13 21Z"
        fill={fill}
        className="nextui-c-PJLV"
      />
    </svg>
  );
};

export default Home;
