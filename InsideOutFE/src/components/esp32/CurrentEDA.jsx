import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:5001/latest";

export default function CurrentEDA() {
  const [eda, setEda] = useState("-");
  const [workload, setWorkload] = useState("-");
  const [stress, setStress] = useState("-");
  const [loading, setLoading] = useState(true);

  const fetchLatest = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setEda(data.gsr ?? "-");
      setWorkload(data.mwl?.label ?? "-");
      setStress(data.gsr_emotion?.label ?? "-");
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLatest(); // fetch once immediately
    const interval = setInterval(fetchLatest, 2000); // fetch every 2s
    return () => clearInterval(interval);
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
          <p className="text-sm text-gray-500">EDA</p>
          <p className="text-3xl font-bold text-green-600">{eda} μS</p>
        </div>

        <div className={`p-4 rounded-xl text-center ${workloadStyle}`}>
          <p className="text-sm text-gray-500">Mental Workload</p>
          <p className="text-xl font-semibold">{workload}</p>
        </div>

        <div className={`p-4 rounded-xl text-center ${stressStyle}`}>
          <p className="text-sm text-gray-500">State</p>
          <p className="text-xl font-semibold">{stress}</p>
        </div>
      </div>
    </div>
  );
}
