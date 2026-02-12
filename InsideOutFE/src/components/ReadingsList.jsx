import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function ReadingsList() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const readingsRef = collection(
          db,
          "elderly",
          "b9sYa0JohQsB68ieybNy",
          "readings",
        );

        const q = query(readingsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReadings(list);
      } catch (err) {
        console.error("Error fetching readings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, []);

  if (loading) return <p className="p-4">Loading readings...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Sensor Readings</h2>

      <div className="space-y-3">
        {readings.map((reading) => (
          <div
            key={reading.id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <p>
              <strong>ID:</strong> {reading.id}
            </p>
            <p>
              <strong>Heart Rate:</strong> {reading.heart_rate}
            </p>
            <p>
              <strong>GSR:</strong> {reading.gsr}
            </p>
            <p>
              <strong>Status:</strong> {reading.status}
            </p>
            <p className="text-sm text-gray-500">
              {reading.timestamp?.toDate().toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
