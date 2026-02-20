import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:5000/latest";

export default function CurrentStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // fetch every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading current status...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div style={{ fontFamily: "sans-serif", lineHeight: 1.6 }}>
      <h2>Current Status</h2>
      <div>
        <strong>GSR:</strong> {data.gsr}
      </div>
      <div>
        <strong>BPM:</strong> {data.bpm}
      </div>
      <div>
        <strong>GSR Emotion:</strong> {data.gsr_emotion.label}(
        {data.gsr_emotion.confidence ?? "N/A"}%)
      </div>
      <div>
        <strong>MWL:</strong> {data.mwl.label}({data.mwl.confidence ?? "N/A"}%)
      </div>
      <div>
        <strong>BPM Emotion:</strong> {data.bpm_emotion.label}(
        {data.bpm_emotion.confidence ?? "N/A"}%)
      </div>
    </div>
  );
}
