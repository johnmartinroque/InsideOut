import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function LatestEDA() {
  const [eda, setEda] = useState("-");
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
        setEda(data.latestEDA ?? "-");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading EDA...</div>;

  return (
    <div className="bg-white shadow rounded-2xl p-5 w-full max-w-sm">
      <h2 className="font-bold text-lg mb-4">EDA Status</h2>

      <div className="space-y-3">
        <div className="p-4 bg-green-50 rounded-xl text-center">
          <p className="text-sm text-gray-500">Latest EDA</p>
          <p className="text-3xl font-bold text-green-600">{eda} μS</p>
        </div>
      </div>
    </div>
  );
}
