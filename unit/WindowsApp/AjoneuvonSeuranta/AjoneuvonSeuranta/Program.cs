using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO.Ports;
using MySql.Data;
using MySql.Data.MySqlClient;


namespace AjoneuvonSeuranta {
    class Program {
        static void Main(string[] args) {
            
            DataReader dr = new DataReader("COM5");

            while(true) {
                dr.ReadDataFromUnit();
                Console.WriteLine("bugget");
            }
        }        
    }
}
