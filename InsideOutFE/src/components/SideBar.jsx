import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logoImg from "../assets/InsideOutLogo.png";

function SideBar({ isExpanded, setIsExpanded }) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

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

  // Base class for items, adjusting padding when collapsed
  const itemClass = `flex items-center w-full p-3 rounded-lg text-left transition-all hover:bg-gray-100 hover:text-gray-900 ${
    !isExpanded ? "justify-center" : ""
  }`;

  return (
    <div
      className={`fixed top-0 left-0 h-screen transition-all duration-300 bg-white shadow-xl z-50 flex flex-col p-4 text-gray-700 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* Header: Logo and Toggle Arrow */}
      <div className="flex items-center justify-between mb-6">
        {isExpanded && (
          <div 
            className="p-1 flex cursor-pointer overflow-hidden"
            onClick={() => navigate("/")}
          >
            <img src={logoImg} alt="Logo" className="h-10 w-auto object-contain" />
          </div>
        )}
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-auto"
        >
          {/* Arrow Icon - rotates based on state */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-2 text-base font-normal overflow-hidden">
        {/* Dashboard */}
        <button onClick={() => navigate("/")} className={itemClass} title="Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z" clipRule="evenodd" />
          </svg>
          {isExpanded && <span className="ml-3 transition-opacity duration-300">Dashboard</span>}
        </button>

        {/* Profile */}
        <button onClick={() => navigate("/profile")} className={itemClass} title="Profile">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z" clipRule="evenodd" />
          </svg>
          {isExpanded && <span className="ml-3 transition-opacity duration-300">Profile</span>}
        </button>

        {/* Settings */}
        <button onClick={() => navigate("/settings")} className={itemClass} title="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M11.983 1.25a1 1 0 01.934.643l.39 1.17a8.048 8.048 0 011.844.77l1.11-.555a1 1 0 011.19.225l1.414 1.414a1 1 0 01.225 1.19l-.555 1.11a8.048 8.048 0 01.77 1.844l1.17.39a1 1 0 01.643.934v2a1 1 0 01-.643.934l-1.17.39a8.048 8.048 0 01-.77 1.844l.555 1.11a1 1 0 01-.225 1.19l-1.414 1.414a1 1 0 01-1.19.225l-1.11-.555a8.048 8.048 0 01-1.844.77l-.39 1.17a1 1 0 01-.934.643h-2a1 1 0 01-.934-.643l-.39-1.17a8.048 8.048 0 01-1.844-.77l-1.11.555a1 1 0 01-1.19-.225L3.1 18.9a1 1 0 01-.225-1.19l.555-1.11a8.048 8.048 0 01-.77-1.844l-1.17-.39A1 1 0 011 12.983v-2a1 1 0 01.643-.934l1.17-.39a8.048 8.048 0 01.77-1.844l-.555-1.11a1 1 0 01.225-1.19L4.667 4.1a1 1 0 011.19-.225l1.11.555a8.048 8.048 0 011.844-.77l.39-1.17A1 1 0 0110.983 1.25h2z" clipRule="evenodd" />
          </svg>
          {isExpanded && <span className="ml-3 transition-opacity duration-300">Settings</span>}
        </button>

        {/* Dark Mode Toggle - Icon only switch when collapsed */}
        <div className={itemClass} title="Dark Mode">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          {isExpanded && (
            <div className="ml-3 flex items-center justify-between flex-1 transition-opacity duration-300">
              <span>Dark Mode</span>
              <div 
                onClick={() => setIsDark(!isDark)}
                className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className={itemClass} title="Logout">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M16 17l5-5-5-5v3H9v4h7v3zM4 4h7v2H6v12h5v2H4V4z" clipRule="evenodd" />
          </svg>
          {isExpanded && <span className="ml-3 text-red-600 transition-opacity duration-300">Logout</span>}
        </button>
      </nav>
    </div>
  );
}

export default SideBar;