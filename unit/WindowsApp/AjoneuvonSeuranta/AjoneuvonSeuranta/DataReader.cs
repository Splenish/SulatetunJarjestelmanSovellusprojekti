using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO.Ports;

namespace AjoneuvonSeuranta {
    class DataReader {
        private SerialPort sp = null;
        private bool firstTime = true;
        private DataBase db = null;

        //port COM5 is standard
        public DataReader(string portName) {
            sp = new SerialPort(portName);
            db = new DataBase();
            db.OpenConnection();
            sp.Open();
        }

        public int Device_id { get; set; }
        public float Lat { get; set; }
        public float Lng { get; set; }
        public float Temp { get; set; }
        public string Status { get; set; }


        public void ReadDataFromUnit() {

            try {
                string indata = sp.ReadLine();
                string[] data = indata.Split(',');
                if(!firstTime) {
                    Device_id = int.Parse(data[0]);
                    Lat = float.Parse(data[1]);
                    Lng = float.Parse(data[2]);
                    Temp = float.Parse(data[3]);
                    Status = data[4].Trim('\r');

                    Console.WriteLine("device id: " + Device_id);
                    Console.WriteLine("lat: " + Lat);
                    Console.WriteLine("lng: " + Lng);
                    Console.WriteLine("temp: " + Temp);
                    Console.WriteLine("status: " + Status);
                    db.UploadData(Device_id,Lat,Lng,Temp,Status);
                } else {
                    firstTime = false;
                }
            } catch {
                Console.WriteLine("IOerror");
            }
            
            
           Console.WriteLine("---------------------------");
        }
    }
}
