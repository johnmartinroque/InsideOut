import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 mt-auto w-full">
      {/* Inner container for centered content */}
      <div className="max-w-screen-xl mx-auto px-4 text-center w-full">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} InsideOut. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
