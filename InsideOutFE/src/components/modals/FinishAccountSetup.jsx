import { useState } from "react";
import { auth, db } from "../../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default function FinishAccountSetup({ isOpen, onClose }) {
  const [elderlyID, setElderlyID] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    // Remove non-numeric characters
    let value = e.target.value.replace(/\D/g, "");

    // Limit to 11 digits
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    setPhoneNumber(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const user = auth.currentUser;
    if (!user) return setMessage("User not logged in");

    if (!elderlyID.trim() || !phoneNumber.trim() || !fullName.trim()) {
      return setMessage("Please fill in all fields");
    }

    if (phoneNumber.length !== 11) {
      return setMessage("Phone number must be exactly 11 digits");
    }

    try {
      setLoading(true);

      // 1️⃣ Update Firestore
      await updateDoc(doc(db, "companion", user.uid), {
        elderlyID: elderlyID.trim(),
        phoneNumber: phoneNumber,
        fullName: fullName.trim(),
      });

      // 2️⃣ Fetch updated document
      const companionRef = doc(db, "companion", user.uid);
      const companionSnap = await getDoc(companionRef);

      let updatedData = {};

      if (companionSnap.exists()) {
        updatedData = companionSnap.data();
      }

      // 3️⃣ Update localStorage
      const existingUserInfo =
        JSON.parse(localStorage.getItem("userInfo")) || {};

      const updatedUserInfo = {
        ...existingUserInfo,
        elderlyID: updatedData.elderlyID || "",
        fullName: updatedData.fullName || "",
        phoneNumber: updatedData.phoneNumber || "",
      };

      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      setMessage("Information saved successfully!");

      setTimeout(() => {
        setMessage("");
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] w-full h-full min-h-screen flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 pointer-events-auto">
      
      {/* Modal Card */}
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
        
        {/* Header Section (Same as Login/Register) */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Account{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
              Setup
            </span>
          </h2>
          <p className="text-gray-500 mt-2">Please complete your details</p>
        </div>

        {/* error or success message (same as login) */}
        {message && (
          <div className={`p-3 rounded-xl mb-6 text-sm border text-center ${
            message.includes("complete") 
            ? "bg-green-50 text-green-600 border-green-100" 
            : "bg-red-50 text-red-600 border-red-100"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Companion Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Companion Name</label>
            <input
              type="text"
              required
              placeholder="Juan Dela Cruz"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50 focus:bg-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Phone Number</label>
            <input
              type="text"
              required
              placeholder="09XXXXXXXXX"
              maxLength="11"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50 focus:bg-white"
              value={phoneNumber}
              onChange={handlePhoneChange}
            />
          </div>

          {/* Elderly ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Elderly ID</label>
            <input
              type="text"
              required
              placeholder="Enter Pairing ID"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50 focus:bg-white font-mono text-xs"
              value={elderlyID}
              onChange={(e) => setElderlyID(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : "Finish Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}