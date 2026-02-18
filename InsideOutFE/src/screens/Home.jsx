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
    <div>
      <h1>Welcome to InsideOut</h1>
      {/* Show modal if elderlyID missing */}
      <FinishAccountSetup
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      <DateTime />
      <CurrentStatus />
      <ESP32Detector />
      <CurrentBPM />
      <CurrentBPMChart />
      <CurrentEDA />
      <CurrentEDAChart />
    </div>
  );
}

export default Home;
