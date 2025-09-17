#include <Wire.h>
#include "MAX30105.h"        // SparkFun MAX3010x library
#include "spo2_algorithm.h"
#include <WiFi.h>
#include <WebServer.h>

// ---------- WiFi Setup ----------
const char* ssid = "HUAWEI-2.4G-eAX8";
const char* password = "pWfm5Aba";

WebServer server(80);

// ---------- MAX30102 Setup ----------
MAX30105 particleSensor;
#define BUFFER_SIZE 100
uint32_t irBuffer[BUFFER_SIZE];
uint32_t redBuffer[BUFFER_SIZE];

int32_t spo2;
int8_t validSPO2;
int32_t heartRate;
int8_t validHeartRate;

void handleRoot() {
  server.send(200, "text/plain", "ESP32 MAX30102 Running");
}

// New: JSON API
void handleData() {
  String json = "{";
  json += "\"heartRate\": " + String(validHeartRate ? heartRate : 0) + ",";
  json += "\"spo2\": " + String(validSPO2 ? spo2 : 0);
  json += "}";
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("ESP32 Boot OK!");

  // ---------- Sensor Init ----------
  Wire.begin(6, 7); // SDA=6, SCL=7 (ESP32-C3)
  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("MAX30102 not found!");
    while (1);
  }
  particleSensor.setup(0x1F, 4, 2, 100, 411, 4096);
  Serial.println("MAX30102 initialized!");

  // Collect initial samples
  for (int i = 0; i < BUFFER_SIZE; i++) {
    while (!particleSensor.available()) particleSensor.check();
    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample();
    delay(10);
  }

  // ---------- WiFi Init ----------
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (++retry > 40) {
      Serial.println("\nFailed to connect WiFi");
      return;
    }
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // ---------- Web Server ----------
  server.on("/", handleRoot);
  server.on("/data", handleData); // JSON endpoint
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  // Slide old data
  for (int i = 25; i < BUFFER_SIZE; i++) {
    redBuffer[i - 25] = redBuffer[i];
    irBuffer[i - 25] = irBuffer[i];
  }
  // Get new data
  for (int i = BUFFER_SIZE - 25; i < BUFFER_SIZE; i++) {
    while (!particleSensor.available()) particleSensor.check();
    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample();
    delay(10);
  }

  // Run algorithm
  maxim_heart_rate_and_oxygen_saturation(
    irBuffer, BUFFER_SIZE,
    redBuffer,
    &spo2, &validSPO2,
    &heartRate, &validHeartRate);

  // Debug
  if (validHeartRate && validSPO2) {
    Serial.print("BPM: ");
    Serial.print(heartRate);
    Serial.print(" | SpO2: ");
    Serial.print(spo2);
    Serial.println("%");
  }

  server.handleClient();
}
