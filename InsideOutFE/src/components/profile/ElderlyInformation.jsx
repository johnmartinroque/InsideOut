import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

function ElderlyInformation() {
  const [elderly, setElderly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchElderly = async () => {
      try {
        const stored = localStorage.getItem("userInfo");
        if (!stored) {
          setError("User info not found");
          return;
        }

        const userInfo = JSON.parse(stored);
        const elderlyID = userInfo.elderlyID;

        if (!elderlyID) {
          setError("No elderly assigned");
          return;
        }

        const elderlyRef = doc(db, "elderly", elderlyID);
        const snap = await getDoc(elderlyRef);

        if (!snap.exists()) {
          setError("Elderly record not found");
          return;
        }

        setElderly(snap.data());
      } catch (err) {
        console.error(err);
        setError("Failed to fetch elderly data");
      } finally {
        setLoading(false);
      }
    };

    fetchElderly();
  }, []);

  if (loading) return <p className="p-4">Loading elderly info...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Elderly Information</h2>

      <p>
        <strong>Name:</strong> {elderly.name}
      </p>

      <p>
        <strong>Age:</strong> {elderly.age}
      </p>

      <p>
        <strong>Birthday:</strong>{" "}
        {elderly.birthday?.toDate().toLocaleDateString()}
      </p>
    </div>
  );
}

export default ElderlyInformation;
