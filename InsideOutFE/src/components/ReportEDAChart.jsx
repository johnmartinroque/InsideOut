import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Spinner from "./Spinner";

export default function ReportEDAChart() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return setError("User not logged in");

        const companionSnap = await getDoc(doc(db, "companion", user.uid));
        if (!companionSnap.exists()) return setError("Companion not found");

        const elderlyID = companionSnap.data().elderlyID;

        const timesRef = collection(
          db,
          "elderly",
          elderlyID,
          "readings",
          id,
          "times",
        );

        const q = query(timesRef, orderBy("timestamp", "asc"));
        const snap = await getDocs(q);

        const list = snap.docs.map((d) => {
          const data = d.data();
          const t = data.timestamp?.toDate();

          return {
            time: t?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            timeRange: data.timeRange || "",
            eda: data.gsr_interval_avg,
          };
        });

        setData(list);
      } catch (err) {
        console.error(err);
        setError("Failed to load chart");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white shadow rounded-xl p-5 h-[400px]">
      <h2 className="font-bold mb-4">EDA Average</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [`${value}`, name]}
            labelFormatter={(label, payload) => {
              return payload?.[0]?.payload?.timeRange || label;
            }}
          />
          <Line
            type="monotone"
            dataKey="eda"
            stroke="#0d9488"
            strokeWidth={3}
            name="EDA"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
