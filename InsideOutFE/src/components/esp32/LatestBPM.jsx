import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function LatestBPM() {
  const [bpm, setBpm] = useState("-");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(
      db,
      "elderly",
      "flRsUK8a9mIQIxdUeEhG",
      "readings",
      "2mar",
    );

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setBpm(data.latestBPM ?? "-");
        setLoading(false);
      }
    });

    return () => unsubscribe(); // cleanup listener
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
      </div>
    </div>
  );
}
