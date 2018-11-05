var mysql = require('mysql');

var con = mysql.createConnection({
	host: "localhost",
	user: "dbuser",
	password: "Sepsis123Database",
	database: "AjoneuvonSeuranta"
});

function validateUser() {
	user = document.getElementByName("uname");
	pass = document.getElementByname("psw");
	con.query("SELECT account_id FROM account WHERE user_name = '" + user + "' AND password = '" + pass  + "'", function(err, result) {
		if(err) throw err;
		if(Object.keys(result).length == 1)
			alert("Correct!");
		else
			alert("Not correct!");
		
	});
}


