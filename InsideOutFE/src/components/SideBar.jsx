import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logoImg from "../assets/InsideOutLogo.png";

function SideBar({ isExpanded, setIsExpanded }) {
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

  // UPDATED: Dark theme item classes
  const itemClass = `flex items-center w-full p-3 rounded-lg text-left transition-all 
    hover:bg-gray-700 hover:text-white text-gray-300 group ${
      !isExpanded ? "justify-center" : ""
    }`;

  return (
    <div
      className={`fixed top-0 left-0 h-full transition-all duration-300 z-50 flex flex-col p-4 
      ${
        isExpanded
          ? "w-64 bg-gray-800 shadow-2xl text-white"
          : "w-20 bg-gray-800 shadow-xl text-gray-300 max-[426px]:w-12 max-[426px]:bg-transparent max-[426px]:shadow-none"
      }`}
    >
      {/* Header: Logo and Toggle Arrow */}
      <div className="flex items-center justify-between mb-6">
        {isExpanded && (
          <div
            className="p-1 flex cursor-pointer overflow-hidden items-center gap-2"
            onClick={() => navigate("/")}
          >
            <img
              src={logoImg}
              alt="Logo"
              className="h-10 w-auto object-contain brightness-110"
            />
            <span className="font-bold text-xl sm:text-xl tracking-tight text-white">
              Inside
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Out
              </span>
            </span>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-full transition-colors ml-auto 
            ${
              isExpanded
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "bg-gray-800 text-blue-400 shadow-md hover:bg-gray-700 max-[426px]:text-white"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <nav
        className={`flex flex-col gap-2 text-base font-medium overflow-hidden 
        ${!isExpanded ? "max-[426px]:hidden" : "flex"}`}
      >
        {/* Dashboard */}
        <button
          onClick={() => navigate("/")}
          className={itemClass}
          title="Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 shrink-0 group-hover:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          {isExpanded && <span className="ml-3">Dashboard</span>}
        </button>

        {/* Reports */}
        <button
          onClick={() => navigate("/reports")}
          className={itemClass}
          title="Reports"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 shrink-0 group-hover:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          {isExpanded && <span className="ml-3">Reports</span>}
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate("/profile")}
          className={itemClass}
          title="Profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 shrink-0 group-hover:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {isExpanded && <span className="ml-3">Profile</span>}
        </button>

        {/* Camera */}
        <button
          onClick={() => navigate("/camera")}
          className={itemClass}
          title="Camera"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
            />
          </svg>

          {isExpanded && <span className="ml-3">Camera</span>}
        </button>

        <div className="my-2 border-t border-gray-700" />

        {/* Logout */}
        <button onClick={handleLogout} className={itemClass} title="Logout">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 shrink-0 text-red-500 group-hover:text-red-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M16 17l5-5-5-5v3H9v4h7v3zM4 4h7v2H6v12h5v2H4V4z"
              clipRule="evenodd"
            />
          </svg>
          {isExpanded && (
            <span className="ml-3 text-red-500 group-hover:text-red-400">
              Logout
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}

export default SideBar;
