#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

MAX30105 particleSensor;

long lastBeat = 0;
float beatsPerMinute;
int beatAvg = 0;

void setup()
{
  Serial.begin(115200);
  Wire.begin(6, 7); // SDA, SCL

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST))
  {
    Serial.println("MAX30102 not found.");
    while (1);
  }

  // Sensor configuration (optimized for finger pulse)
  byte ledBrightness = 50;
  byte sampleAverage = 4;
  byte ledMode = 2;
  byte sampleRate = 100;
  int pulseWidth = 411;
  int adcRange = 4096;

  particleSensor.setup(
    ledBrightness,
    sampleAverage,
    ledMode,
    sampleRate,
    pulseWidth,
    adcRange
  );

  Serial.println("Place finger on sensor...");
}

void loop()
{
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue))
  {
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20)
    {
      beatAvg = (beatAvg + beatsPerMinute) / 2;

      Serial.print("BPM: ");
      Serial.print(beatsPerMinute);
      Serial.print("  Avg BPM: ");
      Serial.println(beatAvg);
    }
  }

  if (irValue < 50000)
    Serial.println("No finger detected");
}



https://www.instructables.com/How-to-Build-a-DIY-WiFi-Smart-Oximeter-Using-MAX30/
https://github.com/Probots-Electronics/Wifi-Oximiter-using-MAX30102-and-ESP32/blob/main/WiFi_Oximeter_using_MAX30102_and_ESP32/WiFi_Oximeter_using_MAX30102_and_ESP32.ino
