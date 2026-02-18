import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CurrentEDAChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push({
        time: `10:${i}0`,
        eda: (Math.random() * 5 + 2).toFixed(2),
      });
    }
    setData(arr);
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-5 h-[400px]">
      <h2 className="font-bold mb-4">EDA Chart</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="eda" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
