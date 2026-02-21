import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:5001/latest";

export default function CurrentBPM() {
  const [bpm, setBpm] = useState("-");
  const [emotion, setEmotion] = useState("-");
  const [loading, setLoading] = useState(true);

  const emotionStyles = {
    Calm: "bg-blue-50 text-blue-600",
    Neutral: "bg-blue-50 text-blue-600",
    Happy: "bg-green-50 text-green-600",
    Sad: "bg-yellow-50 text-yellow-600",
    Stressed: "bg-red-50 text-red-600",
    Anxious: "bg-red-50 text-red-600",
  };

  const fetchLatest = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setBpm(data.bpm ?? "-");
      setEmotion(data.bpm_emotion?.label ?? "-");
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLatest(); // fetch once immediately
    const interval = setInterval(fetchLatest, 500); // fetch every 2s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading BPM...</div>;

  return (
    <div className="bg-white shadow rounded-2xl p-5 w-full max-w-sm">
      <h2 className="font-bold text-lg mb-4">Heartbeat Status</h2>

      <div className="space-y-3">
        <div className="p-4 bg-red-50 rounded-xl text-center">
          <p className="text-sm text-gray-500">Heartbeat BPM</p>
          <p className="text-3xl font-bold text-red-600">{bpm}</p>
        </div>

        <div
          className={`p-4 rounded-xl text-center ${emotionStyles[emotion] || "bg-gray-50 text-gray-600"}`}
        >
          <p className="text-sm text-gray-500">Emotion</p>
          <p className="text-xl font-semibold">{emotion}</p>
        </div>
      </div>
    </div>
  );
}
