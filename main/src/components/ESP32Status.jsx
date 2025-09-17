import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // adjust if backend is on another IP

function ESP32Status() {
  const [status, setStatus] = useState("unknown");

  useEffect(() => {
    // Listen for ESP32 status updates
    socket.on("esp32-status", (newStatus) => {
      setStatus(newStatus);
    });

    // Cleanup when component unmounts
    return () => {
      socket.off("esp32-status");
    };
  }, []);

  return (
    <div>
      <h2>
        ESP32 Status:{" "}
        <span
          style={{
            color: status === "connected" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {status}
        </span>
      </h2>
    </div>
  );
}

export default ESP32Status;
