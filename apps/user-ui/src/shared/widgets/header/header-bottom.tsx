"use-client";

import { AlignLeft, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.screenY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky
          ? "fixed top-0 left-0 z-[100] bg-white shadow-lg "
          : "relative "
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between  ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        {/* all drop down*/}

        <div
          className={`w-[260px] ${
            isSticky && "-mb-2"
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Department s</span>
          </div>

          <ChevronDown color='white'/>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
