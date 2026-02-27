import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function ReadingsList() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("User not logged in");
          return;
        }

        // Get companion doc
        const companionRef = doc(db, "companion", user.uid);
        const companionSnap = await getDoc(companionRef);

        if (!companionSnap.exists()) {
          setError("Companion profile not found");
          return;
        }

        const elderlyID = companionSnap.data().elderlyID;

        if (!elderlyID) {
          setError("No elderly assigned to this account.");
          return;
        }

        // Fetch day documents
        const daysRef = collection(db, "elderly", elderlyID, "readings");
        const daysSnap = await getDocs(daysRef);

        const list = daysSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Sort newest first
        list.sort((a, b) => b.id.localeCompare(a.id));

        setDays(list);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch readings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-4">
        <Spinner />
      </div>
    );

  // Convert Firestore doc ID like "21feb" → "February 21, 2026"
  const formatDate = (id) => {
    const months = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };

    const day = parseInt(id.match(/\d+/)[0]);
    const monthStr = id.match(/[a-zA-Z]+/)[0].toLowerCase();
    const month = months[monthStr];

    if (month === undefined || isNaN(day)) return id;

    const date = new Date(new Date().getFullYear(), month, day);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-2 mb-4">
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg font-medium">
          {error}
        </div>
      )}

      <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-6 mt-6 text-center">
        Daily{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
          Reports
        </span>
      </h2>

      {days.length === 0 ? (
        <p className="text-xl text-gray-500 bg-gray-50 p-10 rounded-xl text-center border-2 border-dashed">
          No readings found.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {days.map((d) => (
            <div
              key={d.id}
              onClick={() => navigate(`/report/${d.id}`)}
              className="p-8 bg-white border-2 border-gray-100 rounded-2xl shadow-md hover:shadow-xl hover:border-gray-300 transition-all cursor-pointer"
            >
              {/* Large Date/ID Header */}
              <p className="text-2xl font-bold text-gray-800 mb-4">
                {formatDate(d.id)}
              </p>

              {/* High-Visibility Biometrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col py-2 px-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Average HR
                  </span>
                  <span className="text-3xl font-mono font-bold text-gray-900">
                    {d.averageHB ?? "--"}{" "}
                    <span className="text-sm font-sans text-gray-400">BPM</span>
                  </span>
                </div>

                <div className="flex flex-col py-2 px-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Average GSR
                  </span>
                  <span className="text-3xl font-mono font-bold text-gray-900">
                    {d.averageGSR ?? "--"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
