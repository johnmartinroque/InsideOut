import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/InsideOutLogo.png";

function GuestHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="flex shadow-md py-4 px-4 sm:px-10 bg-gray-800 text-gray-300 min-h-[70px] tracking-wide relative z-50 border-b border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-5 w-full">
        
        {/* Logo & Brand Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoImg} 
            alt="logo"
            className="w-10 sm:w-12 h-auto object-contain transition-transform group-hover:scale-105 brightness-110"
          />
          <span className="font-bold text-xl sm:text-xl tracking-tight text-white">
            InsideOut
          </span>
        </Link>

        {/* Menu */}
        <div className={`max-lg:hidden lg:block ${menuOpen ? "block" : "hidden"}`}>
          <ul className="lg:flex gap-x-6 max-lg:space-y-3 max-lg:fixed max-lg:bg-gray-800 max-lg:w-1/2 max-lg:min-w-[300px] max-lg:top-0 max-lg:left-0 max-lg:p-6 max-lg:h-full max-lg:shadow-2xl max-lg:overflow-auto z-50">
            <li className="max-lg:border-b max-lg:border-gray-700 max-lg:py-3 px-3">
              <Link
                to="/"
                className="hover:text-blue-400 block font-medium text-[15px] transition-colors"
              >
                Home
              </Link>
            </li>
            <li className="max-lg:border-b max-lg:border-gray-700 max-lg:py-3 px-3">
              <Link
                to="/about"
                className="hover:text-blue-400 block font-medium text-[15px] transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex items-center max-lg:ml-auto space-x-3">
          <button
            className="px-5 py-2 text-sm rounded-full font-medium text-white border border-gray-500 bg-transparent hover:bg-gray-700 hover:border-gray-400 transition-all"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="px-5 py-2 text-sm rounded-full font-medium text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            onClick={() => navigate("/register")}
          >
            Sign up
          </button>

          {/* Mobile toggle */}
          <button onClick={handleToggle} className="lg:hidden cursor-pointer">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default GuestHeader;