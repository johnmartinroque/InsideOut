import { useState } from "react";
import { auth, db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function InputElderlyIDModal({ isOpen, onClose }) {
  const [elderlyID, setElderlyID] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const user = auth.currentUser;
    if (!user) return setMessage("User not logged in");

    try {
      setLoading(true);

      await updateDoc(doc(db, "companion", user.uid), {
        elderlyID: elderlyID.trim(),
      });

      setMessage("Elderly ID saved successfully!");
      setElderlyID("");

      setTimeout(() => {
        onClose();
        setMessage("");
      }, 1200);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save Elderly ID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md p-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-lg font-semibold">
              Connect to Elderly Account
            </h3>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
