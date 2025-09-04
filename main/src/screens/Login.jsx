import { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // adjust path if needed

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault(); // prevent page refresh
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Get Firebase ID token (JWT)
      const token = await user.getIdToken();

      // Create an object with user info
      const userData = {
        email: user.email,
        token: token,
      };

      // Save as JSON string
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("Logged in user:", userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Container>
        <Row
          className="justify-content-center mt-5"
          style={{ minHeight: "100vh" }}
        >
          <Col xs={12} md={8} lg={6}>
            <Form
              onSubmit={login}
              style={{
                backgroundColor: "#afafafff",
                padding: "1rem",
                borderRadius: "8px",
              }}
            >
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              {error && <p className="text-danger">{error}</p>}

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
