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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const user = auth.currentUser;
    if (!user) return setMessage("User not logged in");

    if (!elderlyID.trim() || !phoneNumber.trim() || !fullName.trim()) {
      return setMessage("Please fill in all fields");
    }

    try {
      setLoading(true);

      // 1️⃣ Update Firestore
      await updateDoc(doc(db, "companion", user.uid), {
        elderlyID: elderlyID.trim(),
        phoneNumber: phoneNumber.trim(),
        fullName: fullName.trim(),
      });

      // 2️⃣ Fetch updated companion document
      const companionRef = doc(db, "companion", user.uid);
      const companionSnap = await getDoc(companionRef);

      let updatedElderlyID = "";
      let updatedFullName = "";
      let updatedPhoneNumber = "";

      if (companionSnap.exists()) {
        const data = companionSnap.data();
        updatedElderlyID = data.elderlyID || "";
        updatedFullName = data.fullName || "";
        updatedPhoneNumber = data.phoneNumber || "";
      }

      // 3️⃣ Update localStorage userInfo
      const existingUserInfo =
        JSON.parse(localStorage.getItem("userInfo")) || {};

      const updatedUserInfo = {
        ...existingUserInfo,
        elderlyID: updatedElderlyID,
        fullName: updatedFullName,
        phoneNumber: updatedPhoneNumber,
      };

      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      setMessage("Information saved successfully!");

      setTimeout(() => {
        setMessage("");
        onClose();
        window.location.reload(); // optional: forces UI refresh
      }, 1200);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-auto">
      <div className="relative w-full max-w-md p-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-lg font-semibold">
              Finish Setting Up Your Account
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Companion Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Dela Cruz"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09XXXXXXXXX"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Enter Elderly ID</label>
              <input
                type="text"
                value={elderlyID}
                onChange={(e) => setElderlyID(e.target.value)}
                placeholder="Ex: N650pQK08tF0f5bZaTGo"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {message && (
              <p className="text-sm text-center text-blue-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Connect"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
