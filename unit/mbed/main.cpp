#include "mbed.h"
#include "temperature.h"
#include "SPISlave.h"
#include <iostream>
#include <string>
#include <sstream>

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
SPISlave spi(PA_7, PA_6, PA_5, PA_15); //Mosi Miso SCLK SS
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
    std::string temp;
    std::stringstream ss;
    spi.format(8);
    spi.frequency(4000000);
    while(1) {
        if (spi.receive()) {
            switch (spi.read()) {
                case '0':
                    ss.str(std::string());
                    temp.clear();
                    ss << temperature();
                    temp = ss.str();
                    spi.reply(0x00);
                    break;
                case '1':
                    spi.reply(temp[0]);
                    break;
                case '2':
                    spi.reply(temp[1]);
                    break;
                case '3':
                    spi.reply(temp[2]);
                    break;
                case '4':
                    spi.reply(temp[3]);
                    break;
                case '5':
                    spi.reply(temp[4]);
                    break;
                default:
                    break;
            }
        }
    }
}
