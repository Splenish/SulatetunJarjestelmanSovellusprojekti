const express = require('express');
const path = require('path');
const app = express();
const bodyparser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');

//Serve public folders static files
app.use(express.static(path.join(__dirname, 'public')));

//Use bodyparser to parse POST forms (eg. req.body.'input name')
app.use(bodyparser.urlencoded({extended: false}));

//Use cookie parser to manage cookies
app.use(cookieParser());

function query(func) {
	var db = mysql.createConnection({
		host: "localhost",
		user: "dbuser",
		password: "Sepsis123Database",
		database: "AjoneuvonSeuranta"
	});
	db.connect((err) => {
		if (err) {
			throw err;
		}
		console.log('MySQL Connected!');
		return func();
	});
}

app.post('/validateLogin', (req, res) => {
	console.log("Trying to login with " + req.body.uname + req.body.psw);

	res.cookie('un', req.body.uname);
	res.cookie('pw', req.body.psw);
	res.end();
});

const server = app.listen(8080, () => {
	console.log("Server running at port 8080!");
});