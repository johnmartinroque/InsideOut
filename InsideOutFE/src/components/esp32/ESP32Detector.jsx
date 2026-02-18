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
  const [device1, setDevice1] = useState("checking");
  const [device2, setDevice2] = useState("checking");

  useEffect(() => {
    const randomStatus = () => (Math.random() > 0.5 ? "online" : "offline");

    const updateStatus = () => {
      setDevice1(randomStatus());
      setDevice2(randomStatus());
    };

    updateStatus(); // initial check

    const interval = setInterval(updateStatus, 5000); // every 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <StatusCircle status={device1} label="ESP32 Sensor #1 Heartbeat" />
      <StatusCircle status={device2} label="ESP32 Sensor #2 GSR" />
    </div>
  );
}
