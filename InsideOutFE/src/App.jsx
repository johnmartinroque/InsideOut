import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Home from "./screens/Home";
import GuestHeader from "./components/GuestHeader";
import UserHeader from "./components/UserHeader";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";
import Register from "./screens/authentication/Register";
import Login from "./screens/authentication/Login";
import { auth } from "./firebase";

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
    <Router>
      {user ? <UserHeader /> : <GuestHeader />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
