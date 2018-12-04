#include <SPI.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>

typedef struct Coordinate {
    Coordinate(float la, float ln) {
        lat = la;
        lng = ln;
    }
    float lat = 0;
    float lng = 0;
};

TinyGPSPlus gps;
SoftwareSerial ss(4, 3);
int updateFrequency = 5;

void setup() {
    Serial.begin(9600);
    ss.begin(9600);
    SPI.begin();
    digitalWrite(SS, HIGH);
}

byte transferWithDelay(uint8_t com, int dl) {
    byte c = SPI.transfer(com);
    delay(dl);
    return c;
}

float getTemperature() {
    String str;
    digitalWrite(SS, LOW);
    transferWithDelay('1', 10); //Apparently this is 0 in Mbed
    str += (char)transferWithDelay('2', 5);
    str += (char)transferWithDelay('3', 5);
    str += (char)transferWithDelay('4', 5);
    str += (char)transferWithDelay('5', 5);
    str += (char)transferWithDelay('0', 5); //And this is 5???
    digitalWrite(SS, HIGH);
    return str.toFloat();
}

Coordinate getGps() {
    do {
        if (ss.available()) 
            gps.encode(ss.read());
    } while (!gps.location.isUpdated());
    Coordinate c(gps.location.lat(), gps.location.lng());
    return c;
}

float lastMillis = 0;
float millS = 0;

void loop() {
    float duration = 0;
    float avgTemp = 0;
    Coordinate avgCoord(0,0);
    int times = 0;
    do {
        Coordinate c = getGps();
        avgTemp += getTemperature();
        avgCoord.lat += c.lat;
        avgCoord.lng += c.lng;
        times++;
        millS = millis();
        duration += millS - lastMillis;
        lastMillis = millS;
    } while (duration < (updateFrequency * 1000));
    avgTemp /= times;
    avgCoord.lat /= times;
    avgCoord.lng /= times;
    Serial.print(1); //Device id
    Serial.print(",");
    Serial.print(avgCoord.lat, 6); //Lat
    Serial.print(",");
    Serial.print(avgCoord.lng, 6); //Lng
    Serial.print(",");
    Serial.print(avgTemp); //temp
    Serial.print(",");
    Serial.println("online"); //Status
}