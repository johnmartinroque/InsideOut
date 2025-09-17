import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed

function AddCompanion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const addCompanion = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      // Get logged in user from localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        setError("You must be logged in to add a companion.");
        return;
      }

      // Add to Firestore collection "companions"
      await addDoc(collection(db, "companions"), {
        owner: storedUser.email, // or use storedUser.uid if you save it
        email: email,
        password: password, // ⚠️ better to hash/avoid storing plain password
        createdAt: new Date(),
      });

      setSuccess("Companion added successfully!");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Error adding companion:", err);
      setError("Failed to add companion. Please try again.");
    }
  };

  return (
    <Form
      onSubmit={addCompanion}
      style={{
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "50rem",
      }}
    >
      <h1>Add Companion</h1>

      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter companion email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter companion password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Submit
      </Button>

      {error && (
        <Alert key="danger" variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert key="success" variant="success" className="mt-3">
          {success}
        </Alert>
      )}
    </Form>
  );
}

export default AddCompanion;
