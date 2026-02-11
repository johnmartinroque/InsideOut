import React, { use, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="flex shadow-md py-4 px-4 sm:px-10 bg-white min-h-[70px] tracking-wide relative z-50">
      <div className="flex flex-wrap items-center justify-between gap-5 w-full">
        {/* Logo */}
        <Link to="/" className="max-sm:hidden">
          <img
            src="https://readymadeui.com/readymadeui.svg"
            alt="logo"
            className="w-36"
          />
        </Link>
        <a href="#" className="hidden max-sm:block">
          <img
            src="https://readymadeui.com/readymadeui-short.svg"
            alt="logo"
            className="w-9"
          />
        </a>

        {/* Menu */}
        <div
          className={`max-lg:hidden lg:block ${menuOpen ? "block" : "hidden"}`}
        >
          <ul className="lg:flex gap-x-4 max-lg:space-y-3 max-lg:fixed max-lg:bg-white max-lg:w-1/2 max-lg:min-w-[300px] max-lg:top-0 max-lg:left-0 max-lg:p-6 max-lg:h-full max-lg:shadow-md max-lg:overflow-auto z-50">
            <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
              <Link
                to="/"
                className="hover:text-blue-700 text-blue-700 block font-medium text-[15px]"
              >
                Home
              </Link>
            </li>
            <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
              <Link
                to="/profile"
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                Profile
              </Link>
            </li>
            <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
              <Link
                to="/settings"
                className="hover:text-blue-700 text-slate-900 block font-medium text-[15px]"
              >
                Settings
              </Link>
            </li>
            {/* Add more menu items here */}
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex max-lg:ml-auto space-x-4">
          <button
            className="px-4 py-2 text-sm rounded-full font-medium text-slate-900 border border-gray-400 bg-transparent hover:bg-gray-50 transition-all"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="px-4 py-2 text-sm rounded-full font-medium text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all"
            onClick={() => navigate("/register")}
          >
            Sign up
          </button>

          {/* Mobile toggle */}
          <button onClick={handleToggle} className="lg:hidden cursor-pointer">
            <svg className="w-7 h-7" fill="#000" viewBox="0 0 20 20">
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

export default Header;
