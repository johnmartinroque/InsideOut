#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

MAX30105 particleSensor;

const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;

long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

void setup()
{
  Serial.begin(115200);
  Wire.begin(6, 7); // YOUR PINS

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

void loop()
{
  long irValue = particleSensor.getIR();

  if (irValue > 7000)
  {
    if (checkForBeat(irValue))
    {
      long delta = millis() - lastBeat;
      lastBeat = millis();

      beatsPerMinute = 60 / (delta / 1000.0);

      if (beatsPerMinute > 20 && beatsPerMinute < 255)
      {
        rates[rateSpot++] = (byte)beatsPerMinute;
        rateSpot %= RATE_SIZE;

        beatAvg = 0;
        for (byte x = 0; x < RATE_SIZE; x++)
          beatAvg += rates[x];

        beatAvg /= RATE_SIZE;

        Serial.print("BPM: ");
        Serial.print(beatsPerMinute);
        Serial.print(" | Avg BPM: ");
        Serial.println(beatAvg);
      }
    }
  }
  else
  {
    Serial.println("No finger detected");
    delay(500);
  }
}
