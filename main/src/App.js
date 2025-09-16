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

function App() {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

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
