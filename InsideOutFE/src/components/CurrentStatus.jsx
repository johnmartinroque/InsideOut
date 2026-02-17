// CurrentStatus.jsx
import React, { useEffect, useState } from "react";

const ESP32_URL = import.meta.env.VITE_ESP32_URL; // from .env

export default function CurrentStatus() {
  const [data, setData] = useState({ gsr: "-", bpm: "-" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest data
  const fetchData = async () => {
    try {
      const res = await fetch(`${ESP32_URL}/status`);
      if (!res.ok) throw new Error("Failed to fetch ESP32 data");
      const json = await res.json();
      setData({
        gsr: json.gsr ?? "-",
        bpm: json.bpm ?? "-",
      });
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Poll every 2 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 text-center">
      <h2 className="text-xl font-bold text-gray-800">ESP32 Sensor Status</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-gray-700 font-semibold">GSR</p>
            <p className="text-2xl font-bold">{data.gsr}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-gray-700 font-semibold">BPM</p>
            <p className="text-2xl font-bold">{data.bpm}</p>
          </div>
        </div>
      )}
    </div>
  );
}
