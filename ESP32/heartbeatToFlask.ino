#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <WiFi.h>

MAX30105 particleSensor;

// WIFI
const char* ssid = "HUAWEI-2.4G-eAX8";
const char* password = "pWfm5Aba";

// Flask server
const char* host = "192.168.100.33"; // ← CHANGE to your PC IP
const int port = 5000;

WiFiClient client;

const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;

long lastBeat = 0;
float beatsPerMinute;
int beatAvg;
float lastBPM = 0;

unsigned long lastSend = 0;
const int sendInterval = 5000; // send every 5 sec

void setup()
{
  Serial.begin(115200);
  Wire.begin(6, 7);

  // WIFI CONNECT
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST))
  {
    Serial.println("MAX30102 not found");
    while (1);
  }

  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeIR(0x1F);

  Serial.println("Place finger on sensor...");
}

void sendBPM(int bpm)
{
  if (!client.connect(host, port))
  {
    Serial.println("Connection failed");
    return;
  }

  String postData = "{\"bpm\":" + String(bpm) + "}";

  client.println("POST /bpm HTTP/1.1");
  client.println("Host: " + String(host));
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(postData.length());
  client.println();
  client.print(postData);

  delay(10);
  client.stop();

  Serial.println("Sent BPM to server: " + String(bpm));
}

void loop()
{
  long irValue = particleSensor.getIR();

  if (irValue > 50000)
  {
    if (checkForBeat(irValue))
    {
      long delta = millis() - lastBeat;
      lastBeat = millis();

      beatsPerMinute = 60 / (delta / 1000.0);

      if (beatsPerMinute > 20 && beatsPerMinute < 255)
      {
        if (lastBPM > 0 && abs(beatsPerMinute - lastBPM) > 20)
        {
          Serial.println("Movement detected!");
        }
        else
        {
          rates[rateSpot++] = (byte)beatsPerMinute;
          rateSpot %= RATE_SIZE;

          beatAvg = 0;
          for (byte x = 0; x < RATE_SIZE; x++)
            beatAvg += rates[x];
          beatAvg /= RATE_SIZE;

          Serial.print("Avg BPM: ");
          Serial.println(beatAvg);
        }

        lastBPM = beatsPerMinute;
      }
    }
  }
  else
  {
    beatAvg = 0;
    lastBPM = 0;
    for (byte x = 0; x < RATE_SIZE; x++)
      rates[x] = 0;

    Serial.println("No finger detected");
    delay(500);
  }

  // SEND EVERY FEW SECONDS
  if (millis() - lastSend > sendInterval && beatAvg > 0)
  {
    sendBPM(beatAvg);
    lastSend = millis();
  }
}
