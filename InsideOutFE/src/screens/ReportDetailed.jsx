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
import Spinner from "../components/Spinner";
import ReportGSRChart from "../components/ReportGSRChart";
import ReportHeartbeatChart from "../components/ReportHeartbeatChart";

export default function ReportDetailed() {
  const { id } = useParams(); // day id from URL
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

        // 1️⃣ get companion
        const companionRef = doc(db, "companion", user.uid);
        const companionSnap = await getDoc(companionRef);

        if (!companionSnap.exists()) {
          setError("Companion profile not found");
          return;
        }

        const elderlyID = companionSnap.data().elderlyID;
        if (!elderlyID) {
          setError("No elderly assigned");
          return;
        }

        // 2️⃣ get daily averages
        const dayRef = doc(db, "elderly", elderlyID, "readings", id);
        const daySnap = await getDoc(dayRef);

        if (!daySnap.exists()) {
          setError("Day report not found");
          return;
        }

        setAvg(daySnap.data());

        // 3️⃣ fetch times subcollection
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

        const readings = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setData(readings);
      } catch (err) {
        console.error(err);
        setError("Failed to load report");
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
      <div className="border rounded-xl p-5 shadow bg-white">
        <h1 className="text-2xl font-bold mb-3">Report — {id}</h1>

        <div className="flex gap-8">
          <p>
            <strong>Average HR:</strong> {avg?.averageHB ?? "--"}
          </p>

          <p>
            <strong>Average GSR:</strong> {avg?.averageGSR ?? "--"}
          </p>
        </div>
      </div>

      {/* READINGS LIST */}
      <div className="space-y-3">
        {data.length === 0 ? (
          <p>No readings found for this day.</p>
        ) : (
          data.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 shadow bg-white">
              <p>
                <strong>Time:</strong>{" "}
                {r.timestamp?.toDate().toLocaleTimeString()}
              </p>

              <p>
                <strong>Heart Rate:</strong> {r.heart_rate}
              </p>

              <p>
                <strong>GSR:</strong> {r.gsr}
              </p>

              <p>
                <strong>Status:</strong> {r.status}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="space-y-6">
        <ReportHeartbeatChart />
        <ReportGSRChart />
      </div>
    </div>
  );
}
