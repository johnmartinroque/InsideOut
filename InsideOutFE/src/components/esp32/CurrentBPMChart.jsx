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

export default function CurrentBPMChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const generate = () => {
      const arr = [];
      for (let i = 0; i < 10; i++) {
        arr.push({
          time: `10:${i}0`,
          bpm: Math.floor(Math.random() * 40) + 60,
        });
      }
      setData(arr);
    };

    generate();
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-5 h-[400px]">
      <h2 className="font-bold mb-4">Heartbeat Chart</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="bpm" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
