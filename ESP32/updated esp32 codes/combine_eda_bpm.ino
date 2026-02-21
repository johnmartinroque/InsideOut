#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

#define SENSOR_PIN 0

MAX30105 sensor;

// WIFI
const char* ssid = "";
const char* password = "";
const char* serverName = "http://ipAddress:5001/data";

// ---------- GSR ----------
const float VCC = 3.3;
const int ADC_MAX = 4095;

unsigned long lastSend = 0;
const int sendInterval = 5000;

float sum = 0;
int count = 0;

// ---------- BPM ----------
long lastBeat = 0;
float lastBPM = 0;


// ======================================================
// WIFI CONNECT
// ======================================================
void connectWiFi()
{
  WiFi.begin(ssid, password);
  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
}


// ======================================================
// SEND GSR
// ======================================================
void sendGSR(float value)
{
  if (WiFi.status() != WL_CONNECTED)
  {
    connectWiFi();
    return;
  }

  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  String json = "{\"device\":\"gsr\",\"value\":" + String(value,3) + "}";

  int code = http.POST(json);

  Serial.print("Sent GSR: ");
  Serial.print(value);
  Serial.print(" | HTTP: ");
  Serial.println(code);

  http.end();
}


// ======================================================
// SEND BPM
// ======================================================
void sendBPM(int bpm)
{
  if (WiFi.status() != WL_CONNECTED)
  {
    connectWiFi();
    return;
  }

  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  String json = "{\"device\":\"bpm\",\"value\":" + String(bpm) + "}";

  int code = http.POST(json);

  Serial.print("Sent BPM: ");
  Serial.print(bpm);
  Serial.print(" | HTTP: ");
  Serial.println(code);

  http.end();
}


// ======================================================
// SETUP
// ======================================================
void setup()
{
  Serial.begin(115200);

  // WIFI
  connectWiFi();

  // I2C FOR MAX30102
  Wire.begin(6,7);

  if (!sensor.begin(Wire, I2C_SPEED_FAST))
  {
    Serial.println("Sensor not found");
    while (1);
  }

  sensor.setup();
  sensor.setPulseAmplitudeRed(0x0A);
  sensor.setPulseAmplitudeIR(0x1F);
}


// ======================================================
// LOOP
// ======================================================
void loop()
{
  // =========================
  // GSR SECTION
  // =========================
  int raw = analogRead(SENSOR_PIN);
  float voltage = (raw / (float)ADC_MAX) * VCC;

  sum += voltage;
  count++;

  if (millis() - lastSend > sendInterval)
  {
    float avg = sum / count;
    sendGSR(avg);

    sum = 0;
    count = 0;
    lastSend = millis();
  }


  // =========================
  // BPM SECTION
  // =========================
  long ir = sensor.getIR();

  if (ir > 50000)
  {
    if (checkForBeat(ir))
    {
      long now = millis();

      if (lastBeat == 0)
      {
        lastBeat = now;
        return;
      }

      long delta = now - lastBeat;
      lastBeat = now;

      float bpmFloat = 60 / (delta / 1000.0);
      int bpm = round(bpmFloat);

      if (bpm > 30 && bpm < 200)
      {
        if (lastBPM > 0 && abs(bpm - lastBPM) > 25)
        {
          Serial.println("Movement detected — ignored");
        }
        else
        {
          Serial.print("BPM: ");
          Serial.println(bpm);
          sendBPM(bpm);
        }

        lastBPM = bpm;
      }
    }
  }
  else
  {
    Serial.println("No finger");

    lastBeat = 0;
    lastBPM = 0;

    delay(300);
  }

  delay(20);
}