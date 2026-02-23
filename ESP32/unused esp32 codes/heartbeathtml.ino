#include <WiFi.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

const char* ssid = "";
const char* password = "";

WiFiServer server(80);

MAX30105 particleSensor;

long lastBeat = 0;
float beatsPerMinute;
int beatAvg = 0;

void setup()
{
  Serial.begin(115200);
  Wire.begin(6, 7);

  // WiFi connect
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Connected! IP Address: ");
  Serial.println(WiFi.localIP());

  server.begin();

  // Sensor start
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST))
  {
    Serial.println("MAX30102 not found.");
    while (1);
  }

  particleSensor.setup(50, 4, 2, 100, 411, 4096);
}

void loop()
{
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue))
  {
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute > 20 && beatsPerMinute < 255)
      beatAvg = (beatAvg + beatsPerMinute) / 2;
  }

  WiFiClient client = server.available();

  if (client)
  {
    while (client.connected() && !client.available())
      delay(1);

    client.readStringUntil('\r');

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html");
    client.println("Connection: close");
    client.println();
    
    client.println("<!DOCTYPE HTML>");
    client.println("<html>");
    client.println("<head>");
    client.println("<meta http-equiv='refresh' content='1'/>");
    client.println("<title>Heart Rate Monitor</title>");
    client.println("</head>");
    client.println("<body style='text-align:center;font-family:Arial;'>");
    client.println("<h1>ESP32 Heart Rate</h1>");

    if (irValue < 50000)
      client.println("<h2>No Finger Detected</h2>");
    else
    {
      client.print("<h2>BPM: ");
      client.print(beatAvg);
      client.println("</h2>");
    }

    client.println("</body></html>");
    client.stop();
  }
}
