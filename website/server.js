const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');

//Serve public folders static files
app.use(express.static(path.join(__dirname, 'public')));

//Setup view engine to use Handlebars
app.engine('hbs', hbs({
	extname: 'hbs',
	layoutsDir: __dirname + "/public/views/"
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + "/public/views/");

//Use bodyparser to parse POST forms (eg. req.body.'input name')
app.use(bodyparser.urlencoded({extended: false}));

//Use cookie parser to manage cookies
app.use(cookieParser());

//Setup session
app.use(session({secret: 'SepsisMies123'}));


//Setup database and connect to it
var db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "paskaHousu1",
	database: "ajoneuvonseuranta"
});

/*
db.connect(function(err) {
	if (err) throw err;
});*/

app.get('/', function(req, res) {
	if (req.session.account_id) {
		console.log("Rendering profile because session exists");
		res.render('index.hbs', {sessionExists: true});
	}
	else {
		console.log("rending index no session");
		res.render('index.hbs', {sessionExists: false});
	}
});

app.get('/profile', function(req, res) {
	if (req.session.account_id) {
		console.log("Rendering profile because session exists");
		res.render('profile.hbs', {sessionExists: true});
	}
	else {
		console.log("cant access profile without session");
		res.redirect('/');
	}
});

app.get('/map', function(req, res) {
	var units = [
		{id: 1, status: "offline", lat: 64.9987565, lng: 25.497008599999997},
		{id: 2, status: "online", lat: 64.5, lng: 26.497006},
		{id: 3, status: "online", lat: 64.5, lng: 50.497006},
		{id: 4, status: "online", lat: 65.5, lng: 20.497006},
		{id: 5, status: "online", lat: 63.5, lng: 55.497006}
	];
	res.render('map.hbs', {
		units: JSON.stringify(units)
	});
});

app.get('/logout', function(req, res) {
	req.session.destroy(function(err) {
		if (err) {
			res.negotiate(err);
		}
	});
	res.redirect('/');
	console.log('Deleted session id!');
});

app.post('/validateLogin', function(req, res) {
	console.log("Trying to login with " + req.body.uname + " " + req.body.psw);
	var uname = req.body.uname;
	var psw = req.body.psw;
	var sql = "SELECT account_id FROM account WHERE user_name = ? AND password = ?";
	db.query(sql, [uname, psw], function(err, result) {
		if (err) throw err;
		if (result.length > 0) {
			console.log("Valid user pass!");
			req.session.account_id = result[0].account_id;
			res.redirect('/profile');
		}
		else {
			console.log("Invalid user pass!");
			res.redirect('/');
		}
	});
});

const server = app.listen(8080, function() {
	console.log("Server running at port 8080!");
});
