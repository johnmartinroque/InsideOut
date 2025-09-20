import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Data from "./screens/Data";
import Header from "./components/Header";
import Login from "./screens/Login";
import VideoFeed from "./screens/VideoFeed";
import Profile from "./screens/Profile";
import LandingPage from "./screens/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import HeaderGuest from "./components/HeaderGuest";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Register from "./screens/Register";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Save token if needed
        firebaseUser.getIdToken().then((token) => {
          const userData = {
            email: firebaseUser.email,
            token,
          };
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        });
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // optional spinner while checking auth
  }

  return (
    <div>
      <Router>
        {user ? <Header /> : <HeaderGuest />}
        <Routes>
          {/* Public Routes */}
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes  */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data"
            element={
              <ProtectedRoute>
                <Data />
              </ProtectedRoute>
            }
          />

          <Route
            path="/camera"
            element={
              <ProtectedRoute>
                <VideoFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
