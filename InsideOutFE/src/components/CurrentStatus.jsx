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
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold text-gray-800 tracking-tight">Current Status</h2>
      
      {/* Metrics Row - aayusin ko pag nakita ko na data na lumalabas*/}
      <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GSR</span>
          <span className="text-2xl font-mono text-gray-900">{data.gsr}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BPM</span>
          <span className="text-2xl font-mono text-gray-900">{data.bpm}</span>
        </div>
      </div>

      {/* Emotion Data List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center group">
          <span className="text-xs font-semibold text-gray-500">GSR Emotion</span>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-800 uppercase mr-2">{data.gsr_emotion.label}</span>
            <span className="text-xs text-gray-400">({data.gsr_emotion.confidence ?? "N/A"}%)</span>
          </div>
        </div>

        <div className="flex justify-between items-center group">
          <span className="text-xs font-semibold text-gray-500">MWL</span>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-800 uppercase mr-2">{data.mwl.label}</span>
            <span className="text-xs text-gray-400">({data.mwl.confidence ?? "N/A"}%)</span>
          </div>
        </div>

        <div className="flex justify-between items-center group">
          <span className="text-xs font-semibold text-gray-500">BPM Emotion</span>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-800 uppercase mr-2">{data.bpm_emotion.label}</span>
            <span className="text-xs text-gray-400">({data.bpm_emotion.confidence ?? "N/A"}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}