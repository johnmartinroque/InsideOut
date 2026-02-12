import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Spinner from "../Spinner";

export default function CompanionsList() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get elderlyID from localStorage
  const storedUserInfo = localStorage.getItem("userInfo");
  const elderlyID = storedUserInfo
    ? JSON.parse(storedUserInfo).elderlyID
    : null;

  useEffect(() => {
    if (!elderlyID) {
      setError("No elderlyID found in local storage.");
      setLoading(false);
      return;
    }

    const fetchCompanions = async () => {
      try {
        setLoading(true);

        const companionsRef = collection(db, "companion");
        const q = query(
          companionsRef,
          where("elderlyID", "==", elderlyID),
          orderBy("createdAt", "asc"), // optional: order by registration time
        );

        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCompanions(list);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch companions");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanions();
  }, [elderlyID]);

  if (loading)
    return (
      <p className="p-4">
        <Spinner />
      </p>
    );
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (companions.length === 0)
    return <p className="p-4">No companions found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Companions of Elderly</h2>
      <div className="space-y-3">
        {companions.map((c) => (
          <div key={c.id} className="border rounded-lg p-4 shadow bg-white">
            <p>
              <strong>Email:</strong> {c.email}
            </p>
            <p>
              <strong>Companion ID:</strong> {c.companionID}
            </p>
            <p>
              <strong>Joined:</strong> {c.createdAt?.toDate().toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
