import React, { useEffect, useState } from "react";

function StatusCircle({ status, label }) {
  const color =
    status === "online"
      ? "bg-green-500"
      : status === "offline"
        ? "bg-red-500"
        : "bg-gray-400";

  return (
    <div className="flex items-center gap-3 bg-white shadow rounded-xl p-4">
      <div className={`w-5 h-5 rounded-full ${color}`} />
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-gray-500 capitalize">{status}</p>
      </div>
    </div>
  );
}

export default function ESP32Detector() {
  const [deviceStatus, setDeviceStatus] = useState("checking");
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const SERVER = "http://192.168.100.33:5001/latest";
  const OFFLINE_THRESHOLD = 30 * 1000; // 30 seconds

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(SERVER);
        const data = await res.json();

        const now = Date.now();

        if (data.bpm || data.gsr) {
          setLastTimestamp(now); // update last seen
          setDeviceStatus("online");
        } else if (lastTimestamp && now - lastTimestamp > OFFLINE_THRESHOLD) {
          setDeviceStatus("offline");
        }
      } catch (err) {
        setDeviceStatus("offline");
      }
    };

    checkStatus(); // initial check
    const interval = setInterval(checkStatus, 5000); // every 5 sec
    return () => clearInterval(interval);
  }, [lastTimestamp]);

  return <StatusCircle status={deviceStatus} label="ESP32 Sensor" />;
}
