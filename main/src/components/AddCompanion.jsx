import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

function AddCompanion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const addCompanion = async () => {};
  return (
    <Form
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
        <Form.Control type="email" placeholder="Enter email" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>
      <Button variant="primary" type="submit" onClick={addCompanion}>
        Submit
      </Button>
    </Form>
  );
}

export default AddCompanion;
