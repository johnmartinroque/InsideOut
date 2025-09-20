import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

function AddCompanion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleRegisterUser = async () => {
    try {
      setLoading(true);
      const user = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoading(false);
      console.error(err.code);
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h1>Loading....</h1>;
  }

  return (
    <Container>
      <Row
        className="justify-content-center mt-5"
        style={{ minHeight: "100vh" }}
      >
        <Col xs={12} md={8} lg={6}>
          <Form
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "50rem",
            }}
          >
            <h1>Register</h1>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              onClick={handleRegisterUser}
            >
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default AddCompanion;
