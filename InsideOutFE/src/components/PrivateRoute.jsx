import React from "react";
import { Navigate } from "react-router-dom";

// Accepts `children` (the component to render) and optionally a fallback route
function PrivateRoute({ children }) {
  // Check if user is logged in
  const token = localStorage.getItem("token");

  if (!token) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  // Logged in → render children
  return children;
}

export default PrivateRoute;
