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
import SideBar from "./components/SideBar";
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
import Camera from "./screens/Camera";
import Spinner from "./components/Spinner";
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded && user) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isExpanded, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        localStorage.setItem("token", token);
        localStorage.setItem("uid", currentUser.uid);
        setUser(currentUser);
        setIsExpanded(false);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("uid");
        setUser(null);
        setIsExpanded(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Spinner />; // prevent flicker while checking auth

  return (
    <div className="App min-h-screen flex flex-col bg-gray-100">
      <Router>
        {user ? (
          <SideBar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        ) : (
          <GuestHeader />
        )}

        {/* Body logic for sidebar */}
          {user && isExpanded && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" 
            onClick={() => setIsExpanded(false)}
          />
        )}

        <main 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            user 
              ? "pl-20" 
              : "pl-0"
          }`}
        >

        <div className="flex-1">    
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

          <Route
            path="/camera"
            element={
              <PrivateRoute>
                <Camera />
              </PrivateRoute>
            }
          />

          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>

        <Footer />
      </main>
      </Router>
    </div>
  );
}

export default App;
