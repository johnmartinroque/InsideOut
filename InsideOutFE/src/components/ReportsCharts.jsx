import { useEffect, useState } from "react";
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import Spinner from "./Spinner";
import { auth, db } from "../firebase";

export default function ReportsCharts() {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [avg, setAvg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("User not logged in");
          return;
        }

        // companion
        const companionRef = doc(db, "companion", user.uid);
        const companionSnap = await getDoc(companionRef);

        if (!companionSnap.exists()) {
          setError("Companion profile not found");
          return;
        }

        const elderlyID = companionSnap.data().elderlyID;

        // daily doc
        const dayRef = doc(db, "elderly", elderlyID, "readings", id);
        const daySnap = await getDoc(dayRef);

        if (!daySnap.exists()) {
          setError("Day report not found");
          return;
        }

        setAvg(daySnap.data());

        // times subcollection
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

        const readings = snap.docs.map((d) => {
          const t = d.data().timestamp?.toDate();
          return {
            time: t
              ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "--",
            heartRate: d.data().heart_rate,
            gsr: d.data().gsr,
          };
        });

        setData(readings);
      } catch (err) {
        console.error(err);
        setError("Failed to load chart");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading)
    return (
      <p className="p-6">
        <Spinner />
      </p>
    );

  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-white shadow rounded-xl p-5">
        <h1 className="text-2xl font-bold">Report Chart — {id}</h1>

        <div className="flex gap-10 mt-3">
          <p>
            <strong>Average HR:</strong> {avg?.averageHB ?? "--"}
          </p>
          <p>
            <strong>Average GSR:</strong> {avg?.averageGSR ?? "--"}
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white shadow rounded-xl p-5 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="heartRate"
              strokeWidth={3}
              name="Heart Rate"
            />

            <Line type="monotone" dataKey="gsr" strokeWidth={3} name="GSR" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
