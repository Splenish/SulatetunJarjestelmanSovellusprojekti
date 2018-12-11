using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MySql.Data;
using MySql.Data.MySqlClient;


namespace AjoneuvonSeuranta {
    class DataBase {
        private string cs = @"server=193.167.101.121;userid=dbuser;password=Sepsis123Database;database=AjoneuvonSeuranta";
        private MySqlConnection conn = null;

        public DataBase() {

        }
        public void OpenConnection() {
            try {
                conn = new MySqlConnection(cs);
                conn.Open();
                Console.WriteLine("MySql version : {0}",conn.ServerVersion);
            } catch(MySqlException ex) {
                Console.WriteLine("Error: {0}",ex.ToString());
            }
            Console.WriteLine(conn.State.ToString());
        }

        public void UploadData(int device_id, float lat, float lng, float temp, string status) {
            string insertQuery = "INSERT into device_data(device_id, latitude, longitude, temp, status, timestamp) VALUES(@p1, @p2, @p3, @p4, @p5, now());";
            MySqlCommand myCommand = new MySqlCommand(insertQuery);
            myCommand.Parameters.AddWithValue("@p1", device_id);
            myCommand.Parameters.AddWithValue("@p2", lat);
            myCommand.Parameters.AddWithValue("@p3", lng);
            myCommand.Parameters.AddWithValue("@p4", temp);
            myCommand.Parameters.AddWithValue("@p5", status);
            myCommand.Connection = conn;
            try {
                myCommand.ExecuteNonQuery();
                myCommand.CommandText = "DELETE FROM device_data WHERE timestamp < DATE_SUB(now(), INTERVAL 1 DAY)";
                myCommand.ExecuteNonQuery();
            } catch {
                Console.WriteLine("SQl error");
            }
            //myCommand.Connection.Close();
        }
    }
}
