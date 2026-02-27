import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

function ElderlyInformation() {
  const [elderly, setElderly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [elderlyID, setElderlyID] = useState(null);
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

        setElderlyID(elderlyID);

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
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 flex flex-col">
      {/* Visual Header Accent */}
      <div className="h-24 bg-gradient-to-r from-slate-800 via-slate-700 to-blue-800 rounded-t-2xl" />

      <div className="px-6 pb-6 relative">
        {/* Profile Circle */}
        <div className="w-20 h-20 bg-white p-1 rounded-full shadow-md -mt-10 mb-4 flex items-center justify-center mx-auto md:mx-0">
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-blue-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center md:text-left mb-6">
          Elderly Information
        </h2>

        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 w-24 text-sm font-medium">Name</span>
            <span className="text-gray-900 font-semibold">{elderly.name}</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 w-24 text-sm font-medium">
              Elderly ID
            </span>
            <span className="text-blue-700 font-mono text-sm break-all">
              {elderlyID}
            </span>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 w-24 text-sm font-medium">Age</span>
            <span className="text-gray-900 font-semibold">
              {elderly.age} yrs old
            </span>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 w-24 text-sm font-medium">
              Birthday
            </span>
            <span className="text-gray-900 font-semibold">
              {elderly.birthday?.toDate().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ElderlyInformation;
