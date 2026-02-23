import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function DailyAverages() {
  const [avgHB, setAvgHB] = useState("-");
  const [avgGSR, setAvgGSR] = useState("-");
  const [loading, setLoading] = useState(true);

  const fetchAverages = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const companionSnap = await getDoc(doc(db, "companion", user.uid));
      if (!companionSnap.exists()) return;

      const elderlyID = companionSnap.data().elderlyID;

      const today = new Date();
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
      const dayDocId = `${today.getDate()}${months[today.getMonth()]}`;

      const dayRef = doc(db, "elderly", elderlyID, "readings", dayDocId);

      const snap = await getDoc(dayRef);
      if (!snap.exists()) return;

      const data = snap.data();

      setAvgHB(data.averageHB ?? "-");
      setAvgGSR(data.averageGSR ?? "-");
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAverages();
    const interval = setInterval(fetchAverages, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading averages...</div>;

  return (
    <div className="bg-white shadow rounded-2xl p-5 w-full max-w-sm">
      <h2 className="font-bold text-lg mb-4">Average BPM and EDA today</h2>

      <div className="space-y-3">
        {/* Average Heartbeat */}
        <div className="p-4 bg-red-50 rounded-xl text-center">
          <p className="text-sm text-gray-500">Average BPM</p>
          <p className="text-3xl font-bold text-red-600">{avgHB}</p>
        </div>

        {/* Average GSR */}
        <div className="p-4 bg-teal-50 rounded-xl text-center">
          <p className="text-sm text-gray-500">Average GSR</p>
          <p className="text-3xl font-bold text-teal-600">{avgGSR}</p>
        </div>
      </div>
    </div>
  );
}
