#include <SPI.h>


void setup() {
    Serial.begin(9600);
    Serial.println("Setting up SPI Master");
    SPI.begin();
    digitalWrite(SS, HIGH);
}

byte transferWithDelay(uint8_t com, int dl) {
    byte c = SPI.transfer(com);
    delay(dl);
    return c;
}

void getTemperature() {
    String str;
    digitalWrite(SS, LOW);
    transferWithDelay('1', 10); //Apparently this is 0 in Mbed
    str += (char)transferWithDelay('2', 5);
    str += (char)transferWithDelay('3', 5);
    str += (char)transferWithDelay('4', 5);
    str += (char)transferWithDelay('5', 5);
    str += (char)transferWithDelay('0', 5); //And this is 5???
    Serial.println(str);
    digitalWrite(SS, HIGH);
}

void loop() {
    getTemperature();
    delay(5000);
}