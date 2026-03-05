import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function LatestBPM() {
  const [bpm, setBpm] = useState("-");
  const [emotion, setEmotion] = useState("-");
  const [confidence, setConfidence] = useState("-");
  const [loading, setLoading] = useState(true);

  const emotionStyles = {
    Calm: "bg-blue-50 text-blue-600",
    Neutral: "bg-blue-50 text-blue-600",
    Happy: "bg-green-50 text-green-600",
    Sad: "bg-yellow-50 text-yellow-600",
    Stressed: "bg-red-50 text-red-600",
    Anxious: "bg-red-50 text-red-600",
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo?.elderlyID) return;

    const elderlyID = userInfo.elderlyID;

    // 🔥 Auto-generate today ID (2mar format)
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const now = new Date();
    const dayDocId = `${now.getDate()}${months[now.getMonth()]}`;

    const docRef = doc(db, "elderly", elderlyID, "readings", dayDocId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setBpm(data.latestBPM ?? "-");
        setEmotion(data.bpmEmotion ?? "-");
        setConfidence(data.bpmEmotionConfidence ?? "-");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading BPM...</div>;

  return (
    <div className="bg-white shadow rounded-2xl p-5 w-full max-w-sm">
      <h2 className="font-bold text-lg mb-4">Heartbeat Status</h2>

      <div className="space-y-3">
        <div className="p-4 bg-red-50 rounded-xl text-center">
          <p className="text-sm text-gray-500">Latest Heartbeat BPM</p>
          <p className="text-3xl font-bold text-red-600">{bpm}</p>
        </div>

        <div
          className={`p-4 rounded-xl text-center ${
            emotionStyles[emotion] || "bg-gray-50 text-gray-600"
          }`}
        >
          <p className="text-sm text-gray-500">Emotion</p>
          <p className="text-xl font-semibold">{emotion}</p>
          <p className="text-xs mt-1">
            {confidence !== "-" ? `Confidence: ${confidence}%` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
