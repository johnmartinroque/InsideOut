import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Home from "./screens/Home";
import Header from "./components/Header";
import Authentication from "./screens/Authentication";
import HeaderGuest from "./components/HeaderGuest";
import { auth } from "./firebase";
import LandingPage from "./screens/LandingPage";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // cleanup
  }, []);
  return (
    <div>
      <Router>
        {user ? <Header /> : <HeaderGuest />}
        <Routes>
          <Route path="/" element={user ? <Home /> : <LandingPage />} />
          <Route path="/authentication" element={<Authentication />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
