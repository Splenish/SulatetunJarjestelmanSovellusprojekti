//Fetch data passed from Express
var units = [];
var acId = parseInt(document.getElementById("listScript").getAttribute("data-id"));

//Start socket.io connection
var socket = io();
socket.emit('getUnits', acId);
socket.on('getUnits', function(unitData) {
    units = unitData;
    refreshList();
});

//Fetch new example data after 1 seconds
setInterval(function() { socket.emit('getUnits', acId);}, 1000);

var uniqueUnits = [];


function refreshList() {
	uniqueUnits = [];
	var html = "";
	units.forEach(function(unit) {
		var found = false;
		uniqueUnits.forEach(function(uniq) {
			if (uniq.device_id == unit.device_id) {
	        		found = true;
	    		} 
		});
		if (!found) {
	    		uniqueUnits.push(unit);
		}
	});
	uniqueUnits.forEach(function(uniq) {
		html += "<div class=\"grid-list-item-" + uniq.status +"\">";
		html += "<h1>Unit " + uniq.device_id + "</h1>";
		html += "<h4>Location</h4><p>latitude: " + uniq.latitude + ", longitude: " + uniq.longitude + "</p><h4>Sensors</h4 ><p>Temperature: " + uniq.temp + "°C</p>";
		html += uniq.timestamp.split("T")[0] + " " + uniq.timestamp.split("T")[1].split(".")[0] + "</div>";
	});
	document.getElementById('listTarget').innerHTML = html;
}