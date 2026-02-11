import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logoImg from "../assets/InsideOutLogo.png";

function SideBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
      localStorage.removeItem("userInfo");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const itemClass =
    "flex items-center w-full p-3 rounded-lg text-left transition-all hover:bg-gray-100 hover:text-gray-900";

  return (
    <div className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-white p-4 text-gray-700 shadow-xl z-50">

      {/* Logo */}
      <div 
        className="p-2 mb-2 flex cursor-pointer"
        onClick={() => navigate("/")} // Navigates to Home
      >
        <img 
          src={logoImg} 
          alt="InsideOut Logo" 
          className="h-12 w-auto object-contain" 
        />
      </div>

      <nav className="flex flex-col gap-2 text-base font-normal">

        {/* Dashboard */}
        <button onClick={() => navigate("/")} className={itemClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-3"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z"
              clipRule="evenodd"
            />
          </svg>
          Dashboard
        </button>

        {/* Profile */}
        <button onClick={() => navigate("/profile")} className={itemClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-3"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z"
              clipRule="evenodd"
            />
          </svg>
          Profile
        </button>

        {/* Settings */}
        <button onClick={() => navigate("/settings")} className={itemClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-3"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M11.983 1.25a1 1 0 01.934.643l.39 1.17a8.048 8.048 0 011.844.77l1.11-.555a1 1 0 011.19.225l1.414 1.414a1 1 0 01.225 1.19l-.555 1.11a8.048 8.048 0 01.77 1.844l1.17.39a1 1 0 01.643.934v2a1 1 0 01-.643.934l-1.17.39a8.048 8.048 0 01-.77 1.844l.555 1.11a1 1 0 01-.225 1.19l-1.414 1.414a1 1 0 01-1.19.225l-1.11-.555a8.048 8.048 0 01-1.844.77l-.39 1.17a1 1 0 01-.934.643h-2a1 1 0 01-.934-.643l-.39-1.17a8.048 8.048 0 01-1.844-.77l-1.11.555a1 1 0 01-1.19-.225L3.1 18.9a1 1 0 01-.225-1.19l.555-1.11a8.048 8.048 0 01-.77-1.844l-1.17-.39A1 1 0 011 12.983v-2a1 1 0 01.643-.934l1.17-.39a8.048 8.048 0 01.77-1.844l-.555-1.11a1 1 0 01.225-1.19L4.667 4.1a1 1 0 011.19-.225l1.11.555a8.048 8.048 0 011.844-.77l.39-1.17A1 1 0 0110.983 1.25h2z"
              clipRule="evenodd"
            />
          </svg>
          Settings
        </button>

          {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg text-left text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-3"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M16 17l5-5-5-5v3H9v4h7v3zM4 4h7v2H6v12h5v2H4V4z"
              clipRule="evenodd"
            />
          </svg>
          Logout
        </button>

      </nav>

    </div>
  );
}

export default SideBar;
