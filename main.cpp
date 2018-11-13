#include "mbed.h"
#include "temperature.h"

#define VCC 3.3
#define RES 12000

/* CONNECTION
* Rntc is NTC resistor (MF52 10K3470)
* R is normal 12k resistor
* uR is where voltage is measured from
*
* Vcc------Rntc(temp)-|-R---Gnd
*                     |
*                     uR
*/

AnalogIn uR(A0);
Serial pc(USBTX, USBRX);

float temperature() {
    float uRVoltage = uR.read() * VCC;
    float rNtc = (VCC * RES) / uRVoltage - RES;
    rNtc /= 1000;
    int startTemp = 0, endTemp = -1;
    for (int i = 0; i < TEMPS; i++) {
        if (rNtcValues[i] > rNtc) {
            if (i + 1 < TEMPS && rNtcValues[i + 1] <= rNtc) {
                startTemp = TEMP_BEGIN + i * TEMP_DIFF;
                endTemp = TEMP_BEGIN + i * TEMP_DIFF + 1; 
                float slope = (endTemp - startTemp) / (rNtcValues[i + 1] - rNtcValues[i]);
                float deltaRNtc = rNtc - rNtcValues[i];
                float deltaTemp = deltaRNtc * slope;
                return startTemp + deltaTemp;
            }   
        }
    }
    return -99;
}
  

int main() {
    while(1) {
        pc.printf("Temperature (C) = %f\n", temperature());
    }
}
