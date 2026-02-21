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
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import ReportGSRChart from "../components/ReportGSRChart";
import ReportHeartbeatChart from "../components/ReportHeartbeatChart";

export default function ReportDetailed() {
  const { id } = useParams(); // day id from URL
  const navigate = useNavigate();
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
      <button
        onClick={() => navigate("/reports")}
        className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-full shadow-sm hover:shadow-md hover:border-slate-300 transition-all font-bold text-slate-600 text-sm"
      >
        Back to Daily Reports
      </button>
      
      <div className="border rounded-xl p-5 shadow bg-white">
        <h1 className="text-2xl font-bold mb-3">Report — {id}</h1>

        <div className="flex gap-8">
          <p className="flex flex-col">
            <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Average HR
            </strong> 
            <span className="text-4xl font-mono font-bold text-slate-800 leading-none">
              {avg?.averageHB ?? "--"}
            </span>
          </p>

          <p className="flex flex-col">
            <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Average GSR
            </strong> 
            <span className="text-4xl font-mono font-bold text-slate-800 leading-none">
              {avg?.averageGSR ?? "--"}
            </span>
          </p>
        </div>
      </div>

      {/* 
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
      
      */}

      <div className="space-y-6">
        <ReportHeartbeatChart />
        <ReportGSRChart />
      </div>
    </div>
  );
}
