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

  return (
    <div className="p-6">
      {error && <p className="p-4 text-red-500">{error}</p>}

      <h2 className="text-xl font-bold mb-4">Daily Reports</h2>

      {days.length === 0 ? (
        <p>No readings found.</p>
      ) : (
        <div className="space-y-3">
          {days.map((d) => (
            <div
              key={d.id}
              onClick={() => navigate(`/report/${d.id}`)}
              className="border rounded-lg p-4 shadow bg-white cursor-pointer hover:shadow-lg transition"
            >
              <p className="font-semibold text-lg">{d.id}</p>

              <p>
                <strong>Average HR:</strong> {d.averageHB ?? "--"}
              </p>

              <p>
                <strong>Average GSR:</strong> {d.averageGSR ?? "--"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
