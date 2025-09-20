import { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
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
      setSuccess("Successful login");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Login error:", err.code, err.message);

      if (err.code === "auth/invalid-email") {
        setError("Invalid email format. Please enter a valid email.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

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
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "50rem",
              }}
            >
              <h1>Login</h1>
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
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              {/* Error Message */}
              {error && (
                <Alert key="danger" variant="danger">
                  {error}
                </Alert>
              )}
              {/* Success Message  */}
              {success && (
                <Alert key="success" variant="success">
                  {success}
                </Alert>
              )}
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
