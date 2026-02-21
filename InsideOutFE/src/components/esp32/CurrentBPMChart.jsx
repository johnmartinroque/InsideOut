import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { auth, db } from "../../firebase";
import Spinner from "../Spinner";

export default function CurrentBPMChart() {
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

        // --- Get today's date doc ID ---
        const today = new Date();
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
        const dayDocId = `${today.getDate()}${months[today.getMonth()]}`;

        const timesRef = collection(
          db,
          "elderly",
          elderlyID,
          "readings",
          dayDocId,
          "times",
        );
        const q = query(timesRef, orderBy("timestamp", "asc"));
        const snap = await getDocs(q);

        const list = snap.docs.map((d) => {
          const t = d.data().timestamp?.toDate();
          return {
            time: t?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            bpm: d.data().heart_rate,
          };
        });

        setData(list);
      } catch (err) {
        console.error(err);
        setError("Failed to load BPM chart");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white shadow rounded-xl p-5 h-[400px]">
      <h2 className="font-bold mb-4">Current Heart Rate</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="bpm"
            stroke="#ef4444"
            strokeWidth={3}
            name="BPM"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
