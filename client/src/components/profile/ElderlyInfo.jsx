import React from "react";
import { collection, getDoc, getDocs } from "firebase/firestore";

function ElderlyInfo() {
  const fetchElderly = async () => {
    const elderlyCollectionRef = collection(db, "elderly");
    const elderly = await getDoc(elderlyCollectionRef);
  };

  return (
    <div>
      <div className="flex flex-col  items-center bg-white shadow-sm border border-slate-200 rounded-lg w-96 h-100 p-6 gap-10">
        <h1>Elderly Name</h1>
        <p>Account Email</p>
        <p>091223141412</p>
        <p>Companion 1</p>
        <p>Companion 2</p>
        <p>Companion 3</p>
      </div>
    </div>
  );
}

export default ElderlyInfo;
