{
  /* 
  
  import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

function RealTime() {
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const namesCollection = collection(db, "names");
    const q = query(namesCollection);

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const namesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNames(namesData);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleAddName = async () => {
    if (!newName) return;
    await addDoc(collection(db, "names"), { name: newName });
    setNewName("");
  };

  const handleDeleteName = async (id) => {
    await deleteDoc(doc(db, "names", id));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Real-Time Names</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={handleAddName}>Add</button>
      </div>

      <ul>
        {names.map((item) => (
          <li key={item.id}>
            {item.name}{" "}
            <button onClick={() => handleDeleteName(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RealTime;

  */
}
