import React from "react";
import { Col, Container, Row } from "react-bootstrap";

function Home() {
  return (
    <div>
      <Container className="vh-100">
        <Row className="h-100 d-flex  ">
          <Col className="text-center">
            <h1>Inside Out</h1>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
