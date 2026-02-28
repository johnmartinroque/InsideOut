import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

const USER_ID = "alcHApCZqkI4l4XKUbRw";

export default function CurrentStatus() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const now = new Date();
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
    const dayDocId = `${now.getDate()}${months[now.getMonth()]}`;

    const docRef = doc(db, "elderly", USER_ID, "readings", dayDocId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data());
        }
      },
      (err) => {
        setError(err.message);
      },
    );

    return () => unsubscribe();
  }, []);

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!data) return <div>Waiting for live data...</div>;

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold text-gray-800 tracking-tight">
        Current Status
      </h2>

      {/* Latest Metrics */}
      <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            EDA
          </span>
          <span className="text-2xl font-mono text-gray-900">
            {data.latestEDA ?? "--"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            BPM
          </span>
          <span className="text-2xl font-mono text-gray-900">
            {data.latestBPM ?? "--"}
          </span>
        </div>
      </div>

      {/* Daily Averages */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-xs font-semibold text-gray-500">
            Daily Avg EDA
          </span>
          <span className="text-sm font-bold text-gray-800">
            {data.averageGSR ?? "--"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-xs font-semibold text-gray-500">
            Daily Avg BPM
          </span>
          <span className="text-sm font-bold text-gray-800">
            {data.averageHB ?? "--"}
          </span>
        </div>
      </div>
    </div>
  );
}
