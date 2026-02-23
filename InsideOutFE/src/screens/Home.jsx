import React, { useEffect, useState } from "react";
import InputElderlyIDModal from "../components/modals/InputElderlyID";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import DateTime from "../components/DateTime";
import CurrentStatus from "../components/CurrentStatus";
import FinishAccountSetup from "../components/modals/FinishAccountSetup";
import CurrentBPM from "../components/esp32/CurrentBPM";
import CurrentEDA from "../components/esp32/CurrentEDA";
import CurrentBPMChart from "../components/esp32/CurrentBPMChart";
import CurrentEDAChart from "../components/esp32/CurrentEDAChart";
import ESP32Detector from "../components/esp32/ESP32Detector";
import DailyAverages from "../components/DailyAverages";

function Home() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkElderlyID = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "companion", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (!userData.elderlyID) {
          // elderlyID doesn't exist → show modal
          setShowModal(true);
        }
      } else {
        // If companion doc doesn't exist at all, also show modal
        setShowModal(true);
      }
    };

    checkElderlyID();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center">
          Welcome to Inside
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
            Out
          </span>
        </h1>

        <FinishAccountSetup
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-center items-start">
            <DateTime />
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1 flex justify-center">
            <ESP32Detector />
          </div>
        </div>

        <DailyAverages />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start justify-center">
            <CurrentBPM />
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start justify-center">
            <CurrentEDA />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <CurrentBPMChart />
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <CurrentEDAChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
