import React, { useEffect, useState } from "react";

function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    // If you set up Vite proxy: fetch("/api")
    fetch("http://localhost:5000/")
      .then((res) => {
        if (res.ok) {
          setBackendStatus("✅ Backend detected");
        } else {
          setBackendStatus("❌ Backend not detected");
        }
      })
      .catch(() => setBackendStatus("❌ Backend not detected"));
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center">
        <h1 className="text-5xl">HOME</h1>
        <p className="text-xl">{backendStatus}</p>
      </div>
    </div>
  );
}

export default Home;
