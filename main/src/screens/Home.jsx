import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import RealTime from "../components/RealTime";
import AddCompanion from "../components/AddCompanion";
import ESP32Status from "../components/ESP32Status";

function Home() {
  return (
    <div>
      <Container className="vh-100">
        <Row className="h-100 d-flex  ">
          <Col className="text-center">
            <h1>Inside Out</h1>
            <RealTime />
            <AddCompanion />
            <ESP32Status />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
