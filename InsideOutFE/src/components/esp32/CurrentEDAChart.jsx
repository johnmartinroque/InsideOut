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
    <div className="h-[400px] w-full">
      <h2 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
        <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
        EDA Chart
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="eda" 
            stroke="#0d9488" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}