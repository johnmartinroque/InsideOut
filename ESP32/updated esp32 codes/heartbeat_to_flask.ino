#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

MAX30105 sensor;

const char* ssid = "";
const char* password = "";
const char* serverName = "http://<ip address>/data";

long lastBeat = 0;
float lastBPM = 0;

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

void sendData(int bpm) // <-- now int
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

void setup()
{
  Serial.begin(115200);
  Wire.begin(6,7);

  connectWiFi();

  if (!sensor.begin(Wire, I2C_SPEED_FAST))
  {
    Serial.println("Sensor not found");
    while (1);
  }

  sensor.setup();
  sensor.setPulseAmplitudeRed(0x0A);
  sensor.setPulseAmplitudeIR(0x1F);
}

void loop()
{
  long ir = sensor.getIR();

  if (ir > 50000)
  {
    if (checkForBeat(ir))
    {
      long now = millis();

      // Ignore first beat after reset
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
          sendData(bpm);
        }

        lastBPM = bpm;
      }
    }
  }
  else
  {
    Serial.println("No finger");

    // RESET EVERYTHING
    lastBeat = 0;
    lastBPM = 0;

    delay(300);
  }

  delay(20);
}

