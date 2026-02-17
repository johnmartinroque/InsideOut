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
          orderBy("createdAt", "asc"),
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
      <div className="p-4">
        <Spinner />
      </div>
    );
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (companions.length === 0)
    return <p className="p-4">No companions found.</p>;

  return (
   <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 h-fit">
      {/* Header section with Icon */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Companions of Elderly</h2>
      </div>

      <div className="space-y-4">
        {companions.map((c) => (
          <div 
            key={c.id} 
            className="group flex flex-col sm:flex-row items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all duration-200"
          >
            {/* Initial Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
              {c.fullName?.charAt(0).toUpperCase() || c.email?.charAt(0).toUpperCase()}
            </div>

            {/* Information Section */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900 truncate pr-2">
                  {c.fullName || "Unnamed Companion"}
                </h3>
              </div>
              
              <div className="space-y-1.5 text-sm">
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-gray-400 font-medium w-4">📧</span>
                  <span className="truncate">{c.email}</span>
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-gray-400 font-medium w-4">📞</span>
                  <span>{c.phoneNumber || "No phone added"}</span>
                </p>
                
                {/* ID with break-all for mobile safety */}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                    Companion ID
                  </p>
                  <p className="text-xs font-mono text-blue-600 break-all bg-blue-50/50 px-2 py-1 rounded mt-1 inline-block">
                    {c.companionID}
                  </p>
                </div>

                <div className="pt-2 flex items-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {c.createdAt?.toDate().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}