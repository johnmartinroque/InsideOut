#include <WiFi.h>
#include <HTTPClient.h>

#define SENSOR_PIN 0

const char* ssid = "HUAWEI-2.4G-eAX8";
const char* password = "pWfm5Aba";
const char* serverName = "http://192.168.100.33:5001/data";

const float VCC = 3.3;
const int ADC_MAX = 4095;

unsigned long lastSend = 0;
const int sendInterval = 5000;

float sum = 0;
int count = 0;

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

void sendData(float value)
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

void setup()
{
  Serial.begin(115200);
  connectWiFi();
}

void loop()
{
  int raw = analogRead(SENSOR_PIN);
  float voltage = (raw / (float)ADC_MAX) * VCC;

  sum += voltage;
  count++;

  if (millis() - lastSend > sendInterval)
  {
    float avg = sum / count;
    sendData(avg);

    sum = 0;
    count = 0;
    lastSend = millis();
  }

  delay(200);
}
