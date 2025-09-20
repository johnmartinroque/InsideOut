{
  /*
  import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // backend URL

function ESP32Status() {
  const [data, setData] = useState({ heartRate: 0, spo2: 0 });

  useEffect(() => {
    socket.on("esp32-data", (newData) => {
      setData(newData);
    });
    return () => socket.off("esp32-data");
  }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h2>ESP32 MAX30102 Readings</h2>
      <p>
        <b>Heart Rate (BPM):</b>{" "}
        <span style={{ color: data.heartRate > 0 ? "green" : "red" }}>
          {data.heartRate || "No data"}
        </span>
      </p>
      <p>
        <b>SpO₂ (%):</b>{" "}
        <span style={{ color: data.spo2 > 0 ? "blue" : "red" }}>
          {data.spo2 || "No data"}
        </span>
      </p>
    </div>
  );
}

export default ESP32Status;

  
  */
}
