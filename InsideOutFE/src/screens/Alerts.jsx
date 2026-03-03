import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../firebase"; // make sure you initialized Firebase elsewhere
import Spinner from "../components/Spinner";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo || !userInfo.elderlyID) {
      setError("No elderlyID found in localStorage");
      setLoading(false);
      return;
    }

    const elderlyID = userInfo.elderlyID;
    const db = getFirestore(app);
    const alertsRef = collection(db, "elderly", elderlyID, "alerts");
    const q = query(alertsRef, orderBy("timestamp", "desc"), limit(50)); // latest 50 alerts

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching alerts:", err);
        setError("Failed to fetch alerts");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="p-4">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg font-medium text-center">
        {error}
      </div>
    );

  if (!alerts.length)
    return (
      <p className="text-xl text-gray-500 bg-gray-50 p-10 rounded-xl text-center border-2 border-dashed">
        No alerts yet.
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto p-2 mb-4">
      <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-6 mt-6 text-center">
        Alerts{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">
          History
        </span>
      </h2>

      <div className="flex flex-col gap-6">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-6 bg-white border-2 border-gray-100 rounded-2xl shadow-md hover:shadow-xl hover:border-gray-300 transition-all"
          >
            <p className="text-xl font-bold text-gray-800 mb-3">
              {new Date(alert.timestamp.seconds * 1000).toLocaleString()}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col py-2 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  EDA
                </span>
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {alert.gsr_value ?? "--"} μS
                </span>
                <span className="text-sm text-gray-500">
                  {alert.gsr_emotion} ({alert.gsr_confidence ?? "--"}%)
                </span>
              </div>

              <div className="flex flex-col py-2 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  MWL
                </span>
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {alert.mwl_label ?? "--"}
                </span>
                <span className="text-sm text-gray-500">
                  Confidence: {alert.mwl_confidence ?? "--"}%
                </span>
              </div>

              <div className="flex flex-col py-2 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  BPM
                </span>
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {alert.bpm_value ?? "--"} BPM
                </span>
                <span className="text-sm text-gray-500">
                  {alert.bpm_emotion} ({alert.bpm_confidence ?? "--"}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
