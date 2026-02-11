import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import GuestHeader from "./components/GuestHeader";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";
import Register from "./screens/authentication/Register";
import Login from "./screens/authentication/Login";

function App() {
  return (
    <Router>
      <GuestHeader />
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
