import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Home from "./screens/Home";
import GuestHeader from "./components/GuestHeader";
import UserHeader from "./components/UserHeader";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";
import Register from "./screens/authentication/Register";
import Login from "./screens/authentication/Login";
import { auth } from "./firebase";
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from "./screens/LandingPage";
import "./App.css";
import Footer from "./components/Footer";
import AboutUs from "./screens/AboutUs";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        localStorage.setItem("token", token);
        localStorage.setItem("uid", currentUser.uid);
        setUser(currentUser);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("uid");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; // prevent flicker while checking auth

  return (
    <div className="App">
      <Router>
        {user ? <UserHeader /> : <GuestHeader />}

        <Routes>
          <Route path="/" element={user ? <Home /> : <LandingPage />} />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />

          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
