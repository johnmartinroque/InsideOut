import { useEffect, useState } from "react";

export default function CurrentBPM() {
  const [bpm, setBpm] = useState(72);
  const [emotion, setEmotion] = useState("Neutral");

  const getEmotion = (value) => {
    if (value > 90) return "Anxious";
    if (value > 75) return "Sad";
    return "Neutral";
  };

  const emotionStyles = {
    Neutral: "bg-blue-50 text-blue-600",
    Sad: "bg-yellow-50 text-yellow-600",
    Anxious: "bg-red-50 text-red-600",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newBpm = Math.floor(Math.random() * 40) + 60;
      setBpm(newBpm);
      setEmotion(getEmotion(newBpm));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white shadow rounded-2xl p-5 w-full max-w-sm">
      <h2 className="font-bold text-lg mb-4">Heartbeat Status</h2>

      <div className="space-y-3">
        <div className="p-4 bg-red-50 rounded-xl text-center">
          <p className="text-sm text-gray-500">Heartbeat BPM</p>
          <p className="text-3xl font-bold text-red-600">{bpm}</p>
        </div>

        <div className={`p-4 rounded-xl text-center ${emotionStyles[emotion]}`}>
          <p className="text-sm text-gray-500">Emotion</p>
          <p className="text-xl font-semibold">{emotion}</p>
        </div>
      </div>
    </div>
  );
}
