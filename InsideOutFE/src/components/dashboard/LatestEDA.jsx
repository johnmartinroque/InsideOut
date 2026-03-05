import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function LatestEDA() {
  const [eda, setEda] = useState("-");
  const [stress, setStress] = useState("-");
  const [stressConfidence, setStressConfidence] = useState("-");
  const [workload, setWorkload] = useState("-");
  const [workloadConfidence, setWorkloadConfidence] = useState("-");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo?.elderlyID) return;

    const elderlyID = userInfo.elderlyID;

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

        setEda(data.latestEDA ?? "-");
        setStress(data.gsrEmotion ?? "-");
        setStressConfidence(data.gsrEmotionConfidence ?? "-");
        setWorkload(data.mwlLabel ?? "-");
        setWorkloadConfidence(data.mwlConfidence ?? "-");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const workloadStyle =
    workload === "High MWL"
      ? "bg-red-50 text-red-600"
      : "bg-green-50 text-green-600";

  const stressStyle =
    stress === "Stressed" || stress === "Anxious"
      ? "bg-red-50 text-red-600"
      : "bg-blue-50 text-blue-600";

  if (loading) return <div>Loading EDA...</div>;

  return (
    <div className="bg-white shadow rounded-2xl p-5 w-full max-w-sm">
      <h2 className="font-bold text-lg mb-4">EDA Status</h2>

      <div className="space-y-3">
        <div className="p-4 bg-green-50 rounded-xl text-center">
          <p className="text-sm text-gray-500">Latest EDA</p>
          <p className="text-3xl font-bold text-green-600">{eda} μS</p>
        </div>

        <div className={`p-4 rounded-xl text-center ${workloadStyle}`}>
          <p className="text-sm text-gray-500">Mental Workload</p>
          <p className="text-xl font-semibold">{workload}</p>
          <p className="text-xs mt-1">
            {workloadConfidence !== "-"
              ? `Confidence: ${workloadConfidence}%`
              : ""}
          </p>
        </div>

        <div className={`p-4 rounded-xl text-center ${stressStyle}`}>
          <p className="text-sm text-gray-500">State</p>
          <p className="text-xl font-semibold">{stress}</p>
          <p className="text-xs mt-1">
            {stressConfidence !== "-" ? `Confidence: ${stressConfidence}%` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
