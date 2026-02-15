import { useEffect, useState } from "react";

export default function CurrentStatus() {
  const [data, setData] = useState({
    gsr_value: null,
    heartbeat: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ESP32_URL}/status`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch status:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000); // refresh every 2s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-80 text-center border">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Current Sensor Status
        </h2>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading data...</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">GSR Value</p>
              <p className="text-2xl font-semibold text-blue-600">
                {data.gsr_value ?? "--"} μS
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Heartbeat</p>
              <p className="text-2xl font-semibold text-red-600">
                {data.heartbeat ?? "--"} bpm
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
