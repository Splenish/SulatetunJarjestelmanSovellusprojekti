const express = require('express');
const app = express();
const path = require('path');


const server = app.listen(8080, () => {
	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, 'src/index.html'));
	});
});