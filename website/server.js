const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');


//Serve public folders static files
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + "/public/");

//Use bodyparser to parse POST forms (eg. req.body.'input name')
app.use(bodyparser.urlencoded({extended: false}));

//Use cookie parser to manage cookies
app.use(cookieParser());


var db = mysql.createConnection({
	host: "localhost",
	user: "dbuser",
	password: "Sepsis123Database",
	database: "AjoneuvonSeuranta"
});


db.connect(function(err) {
	if (err) throw err;
});

app.post('/validateLogin', function(req, res) {
	console.log("Trying to login with " + req.body.uname + req.body.psw);
	db.query("SELECT * FROM account where user_name = '" + req.body.uname + "' AND password = '" + req.body.psw + "';",
		function(err, result, fields) {
			if (err) throw err;
			if (Object.keys(result).length == 1) {
				console.log("Found user!");
				res.render('profile.html');
			}
			else {
				console.log("User not found!");
				res.render('index.html');
			}
	});
});

const server = app.listen(8080, function() {
	console.log("Server running at port 8080!");
});