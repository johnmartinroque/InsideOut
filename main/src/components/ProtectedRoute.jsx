import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user")); // check stored user

  if (!user) {
    return <Navigate to="/landingpage" replace />;
  }

  return children; // Otherwise, render the protected component
}

export default ProtectedRoute;
