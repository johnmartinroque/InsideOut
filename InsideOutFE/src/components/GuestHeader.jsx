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

        {/* Menu & Mobile Dropdown */}
        <div className={`${menuOpen ? "block" : "hidden"} lg:block max-lg:absolute max-lg:top-[70px] max-lg:right-4 z-50`}>
          <ul className="lg:flex gap-x-6 max-lg:space-y-1 max-lg:bg-gray-800 max-lg:w-48 max-lg:p-2 max-lg:rounded-lg max-lg:shadow-xl max-lg:border max-lg:border-gray-700">
            <li className="px-3">
              <Link
                to="/"
                className="hover:text-blue-400 block py-2 font-medium text-[15px] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li className="px-3">
              <Link
                to="/about"
                className="hover:text-blue-400 block py-2 font-medium text-[15px] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
            </li>

            {/* Divider for mobile */}
            <li className="lg:hidden border-b border-gray-700 my-1 mx-3"></li>

            {/* Login Link - Uniform Style */}
            <li className="lg:hidden px-3">
              <button
                className="w-full text-left py-2 font-medium text-[15px] text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
              >
                Login
              </button>
            </li>

            {/* Sign Up Link - Uniform Style but highlighted */}
            <li className="lg:hidden px-3">
              <button
                className="w-full text-left py-2 font-medium text-[15px] text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => { navigate("/register"); setMenuOpen(false); }}
              >
                Sign up
              </button>
            </li>
          </ul>
        </div>

        {/* Desktop Buttons */}
        <div className="flex items-center space-x-3">
          <div className="max-lg:hidden flex items-center space-x-3">
            <button
              className="px-5 py-2 text-sm rounded-xl font-medium text-white bg-slate-700 hover:bg-slate-600 transition-all"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="px-5 py-2 text-sm rounded-xl font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all"
              onClick={() => navigate("/register")}
            >
              Sign up
            </button>
          </div>

          {/* Mobile toggle */}
          <button onClick={handleToggle} className="lg:hidden cursor-pointer text-white">
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