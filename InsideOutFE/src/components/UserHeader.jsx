import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function UserHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      // Clear stored auth data
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
      localStorage.removeItem("userInfo");

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
          </ul>
        </div>

        {/* Logout Button */}
        <div className="flex max-lg:ml-auto space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm rounded-full font-medium text-white border border-red-600 bg-red-600 hover:bg-red-700 transition-all"
          >
            Logout
          </button>

          {/* Mobile Toggle */}
          <button onClick={handleToggle} className="lg:hidden cursor-pointer">
            <svg className="w-7 h-7" fill="#000" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default UserHeader;
