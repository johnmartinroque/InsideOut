import React, { useEffect, useState } from "react";

function ESP32Status() {
  const [status, setStatus] = useState("Checking...");
  const esp32IP = "http://192.168.100.169/";

  const checkESP32 = async () => {
    try {
      const response = await fetch(esp32IP, { method: "GET" });
      if (response.ok) {
        const text = await response.text();
        setStatus("✅ ESP32 Online: " + text);
      } else {
        setStatus("⚠️ ESP32 Responded but not OK");
      }
    } catch (error) {
      setStatus("❌ ESP32 Offline");
    }
  };

  useEffect(() => {
    checkESP32(); // run once on mount

    const interval = setInterval(checkESP32, 5000); // check every 5 seconds
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <div>
      <h2>ESP32 Status</h2>
      <p>{status}</p>
    </div>
  );
}

export default ESP32Status;
