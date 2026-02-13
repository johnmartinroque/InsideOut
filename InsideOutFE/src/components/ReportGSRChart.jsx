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

export default function ReportGSRChart() {
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
          const t = d.data().timestamp?.toDate();
          return {
            time: t?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            gsr: d.data().gsr,
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
      <h2 className="font-bold mb-4">GSR Chart</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />

          <Line type="monotone" dataKey="gsr" strokeWidth={3} name="GSR" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
