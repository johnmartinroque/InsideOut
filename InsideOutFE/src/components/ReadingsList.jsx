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
import InputElderlyIDModal from "./modals/InputElderlyID";

export default function ReadingsList() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("User not logged in");
          return;
        }

        // 1️⃣ Get companion document
        const companionRef = doc(db, "companion", user.uid);
        const companionSnap = await getDoc(companionRef);

        if (!companionSnap.exists()) {
          setError("Companion profile not found");
          return;
        }

        const companionData = companionSnap.data();
        const elderlyID = companionData.elderlyID;

        if (!elderlyID) {
          // Show the modal if no elderly assigned
          setShowModal(true);
          setError(""); // clear error text
          return;
        }

        // 2️⃣ Fetch readings
        const readingsRef = collection(db, "elderly", elderlyID, "readings");
        const q = query(readingsRef, orderBy("timestamp", "desc"));

        const snapshot = await getDocs(q);

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReadings(list);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch readings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading readings...</p>;

  return (
    <div className="p-6">
      {/* Modal for entering elderly ID */}
      <InputElderlyIDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {error && <p className="p-4 text-red-500">{error}</p>}

      <h2 className="text-xl font-bold mb-4">Elderly Readings</h2>

      {readings.length === 0 ? (
        <p>No readings found.</p>
      ) : (
        <div className="space-y-3">
          {readings.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 shadow bg-white">
              <p>
                <strong>ID:</strong> {r.id}
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
              <p className="text-sm text-gray-500">
                {r.timestamp?.toDate().toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
