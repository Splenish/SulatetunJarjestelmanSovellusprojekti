const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const socketServer = require('http').createServer(app);
const io = require('socket.io')(socketServer);

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
	user: "dbuser",
	password: "Sepsis123Database",
	database: "AjoneuvonSeuranta"
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

app.get('/list', function(req, res) {
	if (req.session.account_id) {
		var sqlQuery = "SELECT data_id, device_data.device_id, latitude, longitude, temp, status FROM device_data INNER JOIN device ON device.device_id = device_data.device_id WHERE account_id = ? ORDER BY timestamp DESC";
		db.query(sqlQuery, [req.session.account_id], function(err, result) {
			if (err) throw err;
			if (result.length > 0) {
				console.log(result);
				console.log("Fetched account id data!");
				res.render('list.hbs', {data: JSON.stringify(result)});
			}
			else {
				console.log("Invalid query");
				res.redirect('/');
			}
		});
	}
	else {
		console.log("cant access profile without session");
		res.redirect('/');
	}
			
});

app.get('/profile', function(req, res) {
	if (req.session.account_id) {
		console.log("Rendering profile because session exists");
		var sqlQuery = "SELECT company_name, first_name, last_name, telephone, email FROM client INNER JOIN account ON client.client_id = account.account_id WHERE account_id = ?";
		db.query(sqlQuery, [req.session.account_id], function(err, result) {
			if (err) throw err;
			if (result.length > 0) {
				console.log(result);
				console.log("Fetched account id data!");
				res.render('profile.hbs', {data: result});
			}
			else {
				console.log("Invalid query");
				res.redirect('/');
			}
		});
	}
	else {
		console.log("cant access profile without session");
		res.redirect('/');
	}
});

app.get('/map', function(req, res) {
	if (req.session.account_id) {
		var sqlQuery = "SELECT data_id, device_data.device_id, latitude, longitude, temp, status FROM device_data INNER JOIN device ON device.device_id = device_data.device_id WHERE account_id = ? ORDER BY timestamp DESC";
		db.query(sqlQuery, [req.session.account_id], function(err, result) {
			if (err) throw err;
			if (result.length > 0) {
				console.log(result);
				console.log("Fetched device data!");
				res.render('map.hbs', {
					units: JSON.stringify(result)
				});
			}
		});
	}
	else {
		console.log('Can\'t access map page without being logged in!');
		res.redirect('/');
	}
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

app.post('/editProfile', function(req, res) {
	if (req.session.account_id) {
		if (req.body.phonenumber != "") {
			var sqlQuery = "UPDATE client c INNER JOIN account a ON c.client_id = a.client_id SET c.telephone = ? WHERE account_id = ?";
			db.query(sqlQuery, [req.body.phonenumber, req.session.account_id], function(err, result) {
				if (err) throw err;
				console.log(result);
			});
		}
		if (req.body.email != "") {
			var sqlQuery = "UPDATE client c INNER JOIN account a ON c.client_id = a.client_id SET c.email = ? WHERE account_id = ?";
			db.query(sqlQuery, [req.body.email, req.session.account_id], function(err, result) {
				if (err) throw err;
				console.log(result);
			});
		}
		res.redirect('/profile');
	}
	else {
		res.redirect('/');
	}
});


app.get('/test', function(req, res) {
	res.render('map.hbs');
});


io.on('connection', function (socket) {
	socket.on('getUnits', function(data) {
		if (data == 0) {
			console.log("Received 0, sending first data");
			io.emit('getUnits', [
				{
					device_id: 1,
					latitude: 64.3,
					longitude: 25.1,
					temp: 25,
					status: 'online',
					timestamp: '22:14:00T9.12.2018'
				},
				{
					device_id: 2,
					latitude: 64,
					longitude: 24.8,
					temp: 25,
					status: 'offline',
					timestamp: '22:14:00T9.12.2018'
				}
			]);
		}
		else if (data == 1) {
			console.log("Received 1, sending second data");
			io.emit('getUnits', [
				{
					device_id: 1,
					latitude: 65.5,
					longitude: 25.5,
					temp: 25,
					status: 'online',
					timestamp: '22:14:00T9.12.2018'
				},
				{
					device_id: 2,
					latitude: 66,
					longitude: 25,
					temp: 25,
					status: 'offline',
					timestamp: '22:14:00T9.12.2018'
				},
				{
					device_id: 3,
					latitude: 66.1,
					longitude: 25.2,
					temp: 25,
					status: 'offline',
					timestamp: '22:14:00T9.12.2018'
				},
				{
					device_id: 4,
					latitude: 65.9,
					longitude: 24.8,
					temp: 25,
					status: 'offline',
					timestamp: '22:14:00T9.12.2018'
				}
			]);
		}
		else if (data == 2) {
			console.log("Received 2, sending second data");
			io.emit('getUnits', [
				{
					device_id: 1,
					latitude: 65.3,
					longitude: 25.5,
					temp: 25,
					status: 'online',
					timestamp: '22:14:00T9.12.2018'
				},
				{
					device_id: 2,
					latitude: 65.7,
					longitude: 25,
					temp: 25,
					status: 'offline',
					timestamp: '22:14:00T9.12.2018'
				},
				{
					device_id: 3,
					latitude: 66,
					longitude: 25.2,
					temp: 25,
					status: 'offline',
					timestamp: '22:14:00T9.12.2018'
				}
			]);
		}
		else if (data == 3) {
			console.log("Received 3, sending second data");
			io.emit('getUnits', [
				{
					device_id: 1,
					latitude: 65.3,
					longitude: 25.5,
					temp: 25,
					status: 'online',
					timestamp: '22:14:00T9.12.2018'
				},
				{
					device_id: 2,
					latitude: 65.7,
					longitude: 25,
					temp: 25,
					status: 'offline',
					timestamp: '22:14:00T9.12.2018'
				}
			]);
		}
		else if (data == 4) {
			console.log("Received 4, sending second data");
			io.emit('getUnits', [
				{
					device_id: 1,
					latitude: 65.3,
					longitude: 25.5,
					temp: 25,
					status: 'online',
					timestamp: '22:14:00T9.12.2018'
				}
			]);
		}
	});
});


socketServer.listen(8080);


/*
const server = app.listen(8080, function() {
	console.log("Server running at port 8080!");
});*/
