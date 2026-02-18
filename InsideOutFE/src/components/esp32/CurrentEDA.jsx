import { useEffect, useState } from "react";

export default function CurrentEDA() {
  const [eda, setEda] = useState(4.2);
  const [workload, setWorkload] = useState("Low");
  const [stress, setStress] = useState("Calm");

  useEffect(() => {
    const interval = setInterval(() => {
      const val = Number((Math.random() * 5 + 2).toFixed(2));
      setEda(val);

      if (val > 5) {
        setWorkload("High");
        setStress("Stressed");
      } else {
        setWorkload("Low");
        setStress("Calm");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const workloadStyle =
    workload === "High"
      ? "bg-red-50 text-red-600"
      : "bg-green-50 text-green-600";

  const stressStyle =
    stress === "Stressed"
      ? "bg-red-50 text-red-600"
      : "bg-blue-50 text-blue-600";

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
