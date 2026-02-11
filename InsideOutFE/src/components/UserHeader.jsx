import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function UserHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
      <div className="flex items-center justify-between w-full">
        {/* Empty div to balance logout button */}
        <div className="w-24"></div>

        {/* Logo centered */}
        <div className="flex justify-center flex-1">
          <img
            src="https://readymadeui.com/readymadeui.svg"
            alt="logo"
            className="w-36"
          />
        </div>

        {/* Logout Button */}
        <div className="w-24 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm rounded-full font-medium text-white border border-red-600 bg-red-600 hover:bg-red-700 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default UserHeader;
