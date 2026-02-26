
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

#define SENSOR_PIN 0

MAX30105 sensor;

// ---------- GSR ----------
const float VCC = 3.3;
const int ADC_MAX = 4095;

unsigned long lastPrint = 0;
const int printInterval = 10000;

float sum = 0;
int count = 0;

// ---------- BPM ----------
long lastBeat = 0;
float lastBPM = 0;


// ======================================================
// SETUP
// ======================================================
void setup()
{
  Serial.begin(115200);

  // I2C FOR MAX30102 (ESP32-C3 pins 6 SDA, 7 SCL)
  Wire.begin(6, 7);

  if (!sensor.begin(Wire, I2C_SPEED_FAST))
  {
    Serial.println("MAX30102 not found");
    while (1);
  }

  sensor.setup();
  sensor.setPulseAmplitudeRed(0x0A);
  sensor.setPulseAmplitudeIR(0x1F);

  Serial.println("System Ready");
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

  if (millis() - lastPrint > printInterval)
  {
    float avg = sum / count;

    Serial.print("Average GSR Voltage: ");
    Serial.println(avg, 3);

    sum = 0;
    count = 0;
    lastPrint = millis();
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
        }

        lastBPM = bpm;
      }
    }
  }
  else
  {
    Serial.println("No pulse detected");

    lastBeat = 0;
    lastBPM = 0;

    delay(300);
  }

  delay(20);
}