//Fetch data passed from Express
var units = JSON.parse(document.getElementById("listScript").getAttribute("data-units"));
var uniqueUnits = [];
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

var html = "";

uniqueUnits.forEach(function(uniq) {
	html += "<div class=\"grid-list-item\">";
	html += "<h3>Unit " + uniq.device_id + "</h3>";
	html += "<p>Location: " + uniq.latitude + " " + uniq.longitude + "<br>Temperature: " + uniq.temp + "</p></div>";
});

document.getElementById('listTarget').innerHTML = html;