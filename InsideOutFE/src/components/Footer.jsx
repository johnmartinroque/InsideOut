import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 mt-auto w-full min-w-full">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} InsideOut. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
