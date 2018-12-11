var units = [];
var acId = parseInt(document.getElementById("mapScript").getAttribute("data-id"));

//Start socket.io connection
var socket = io();
socket.emit('getUnits', acId);
socket.on('getUnits', function(unitData) {
    units = unitData;
    refreshMap();
});

//Fetch new example data after 1 seconds
setInterval(function() { socket.emit('getUnits', acId);}, 1000);

//Fetch data passed from Express
// = JSON.parse(document.getElementById("mapScript").getAttribute("data-units"));
var uniqueUnits = [];
var map;
var infoWindow;
var markers = [];
var mapsLoaded;
var openWindowId;

//Places a marker on the map using units information and attaches a infoWindow on click
function placeMarker(unit) {
    var latLng = new google.maps.LatLng(unit.latitude, unit.longitude);
    var icon = "";
    if (unit.status == "online") {
        icon = "/images/online.png";
    }
    else if (unit.status == "offline") {
        icon = "/images/offline.png";
    }
    var marker = new google.maps.Marker({
      position : latLng,
      map: map,
      icon: icon,
      device_id: unit.device_id
    });
    google.maps.event.addListener(marker, 'click', function(){
        infoWindow.open(map, marker);
        openWindowId = marker.device_id;
        refreshInfoWindow();
    });
    markers.push(marker);
}

function updateMarker(unit) {
    for (var marker = 0; marker < markers.length; marker++) {
        if (markers[marker].device_id == unit.device_id) {
            var latLng = new google.maps.LatLng(unit.latitude, unit.longitude);
            var icon = "";
            if (unit.status == "online") {
                icon = "/images/online.png";
            }
            else if (unit.status == "offline") {
                icon = "/images/offline.png";
            }
            markers[marker].setPosition(latLng);
            markers[marker].setIcon(icon);
        }
    }
    refreshInfoWindow();
}

function refreshInfoWindow() {
    uniqueUnits.forEach(function(unit) {
        if (unit.device_id == openWindowId) {
	    var found = 0;
	    var latLngList = [];
	    units.forEach(function(un) {
		if (found < 2) {				
			if (unit.device_id == un.device_id) {
				found++;
				var obj = {lat: un.latitude, lng: un.longitude, time: un.timestamp};
				latLngList.push(obj);
			}
		}
	    });
	    
	    var time1 = latLngList[0].time; 
	    var time2 = latLngList[1].time;
	    var time1Year = time1.slice(0,4);
	    var time1Mon = time1.slice(5,7);
	    var time1Day = time1.slice(8,10); 
	    var time1Hours = time1.slice(11,13);
	    var time1Minutes = time1.slice(14,16);
	    var time1Seconds = time1.slice(17,19);
	    var d1 = new Date(time1Year, time1Day, time1Hours, time1Minutes, time1Seconds, 0);

	    var time2Year = time2.slice(0,4);
	    var time2Mon = time2.slice(5,7);
	    var time2Day = time2.slice(8,10); 
	    var time2Hours = time2.slice(11,13);
	    var time2Minutes = time2.slice(14,16);
	    var time2Seconds = time2.slice(17,19);
	    var d2 = new Date(time2Year, time2Day, time2Hours, time2Minutes, time2Seconds, 0);

	    var deltaTime = (d1.getTime() - d2.getTime())/1000;

	    var r = 6371e3;
	    var la1 = latLngList[0].lat/180 * Math.PI;
	    var la2 = latLngList[1].lat/180 * Math.PI;
	    var dLa = (latLngList[0].lat - latLngList[1].lat)/180*Math.PI;
	    var dLo = (latLngList[0].lng - latLngList[1].lng)/180*Math.PI;
	    var a = Math.sin(dLa/2) * Math.sin(dLa/2) +
		    Math.cos(la1) * Math.cos(la2) *
		    Math.sin(dLo/2) * Math.sin(dLo/2);
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	    var d = r * c;
	    var speed = (d/deltaTime)*3.6;
            infoWindow.setContent("<h1>Unit " + unit.device_id + "</h1><h4>Location</h4 ><p>Latitude: " + unit.latitude + "<br>Longitude: " + unit.longitude + "</p><h4>Sensors</h4 ><p>Temperature: " + unit.temp + "°C<br>Speed: " + speed.toFixed(2) + " km/h </p>" + unit.timestamp.split("T")[0] + " " + unit.timestamp.split("T")[1].split(".")[0] + "</div>");
        }
    }); 
}

function filterMarker(type) {
    var legend;
    var legendIcon;
    switch (type) {
        case 0:
            legend = document.getElementById("offlineLegend");
            legendIcon = document.getElementById("offlineLegendIcon");
            if (legendIcon.src.search("online.png")) {
                for (var mark = 0; mark < markers.length; mark++) {
                    if (uniqueUnits[mark].status == "offline") {
                        markers[mark].setMap(null);
                    }
                }
                legendIcon.src = "/images/unselected.png";
                legend.setAttribute('onclick',"showMarker(0)");
                return true;
            }
            break;
        case 1:
            for (var mark = 0; mark < markers.length; mark++) {
                legend = document.getElementById("onlineLegend");
                legendIcon = document.getElementById("onlineLegendIcon");
                if (legendIcon.src.search("online.png")) {
                    for (var mark = 0; mark < markers.length; mark++) {
                        if (uniqueUnits[mark].status == "online") {
                            markers[mark].setMap(null);
                        }
                    }
                    legendIcon.src = "/images/unselected.png";
                    legend.setAttribute('onclick',"showMarker(1)");
                    return true;
                }
            }
            break;
        default:
    }
    return false;
}

function showMarker(type) {
    var legend;
    var legendIcon;
    switch (type) {
        case 0:
            legend = document.getElementById("offlineLegend");
            legendIcon = document.getElementById("offlineLegendIcon");
            for (var mark = 0; mark < markers.length; mark++) {
                if (uniqueUnits[mark].status == "offline") {
                    markers[mark].setMap(map);
                    legendIcon.src = "/images/offline.png";
                    legend.setAttribute('onclick',"filterMarker(0)");
                }
            }
            break;
        case 1:
            legend = document.getElementById("onlineLegend");
            legendIcon = document.getElementById("onlineLegendIcon");
            for (var mark = 0; mark < markers.length; mark++) {
                if (uniqueUnits[mark].status == "online") {
                    markers[mark].setMap(map);
                    legendIcon.src = "/images/online.png";
                    legend.setAttribute('onclick',"filterMarker(1)");
                }
            }
            break;
        default:
    }
}

function resetMarkers() {
    for (var mark = 0; mark < markers.length; mark++) {
        markers[mark].setMap(map);
    }
    document.getElementById("offlineLegend").setAttribute('onclick',"filterMarker(0)");
    document.getElementById("onlineLegend").setAttribute('onclick',"filterMarker(1)");
    document.getElementById("offlineLegendIcon").src = "/images/offline.png";
    document.getElementById("onlineLegendIcon").src = "/images/online.png";
}

function initMap() {
    //Initialize the map
    map = new google.maps.Map(document.getElementById('map'));
    refreshMap();
    var legend = document.getElementById("offlineLegend");
    legend.setAttribute('onclick',"filterMarker(0)");
    legend = document.getElementById("onlineLegend");
    legend.setAttribute('onclick',"filterMarker(1)");
}

function refreshMap() {
    if (units.length > 0) {
        uniqueUnits = [];
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
        //If the map has not been fully initialized calculate the starting center and initialize other elements
        if (!mapsLoaded) {
            var latLngList = [];
            var center = {lat: 0, lng: 0};
            for (var i = 0; i < uniqueUnits.length; i++) {
                center.lat += uniqueUnits[i].latitude;
                center.lng += uniqueUnits[i].longitude;
                latLngList.push(new google.maps.LatLng(uniqueUnits[i].latitude, uniqueUnits[i].longitude));
            }
            center.lat /= uniqueUnits.length;
            center.lng /= uniqueUnits.length;

            var bounds = new google.maps.LatLngBounds();
            latLngList.forEach(function(n) {
                bounds.extend(n);
            });

            infoWindow = new google.maps.InfoWindow({
                content: "<div id=\"infowin\"></div>"
            });

            map.fitBounds(bounds);
            mapsLoaded = map;
            
            for (var i = 0; i < uniqueUnits.length; i++) {
                placeMarker(uniqueUnits[i]);
            }
        }
        else {
            //Modify old markers position if there is no new units
            if (uniqueUnits.length == markers.length) {
                for (var i = 0; i < uniqueUnits.length; i++) {
                    updateMarker(uniqueUnits[i]);
                }
            }
            //If there is new units update old markers and push in the new unit
            else {
                while (markers.length > uniqueUnits.length) {
                    markers[markers.length-1].setMap(null);
                    markers.pop();
                }
                for (var i = 0; i < uniqueUnits.length; i++) {
                    if (i < markers.length) {
                        updateMarker(uniqueUnits[i]);
                    }
                    else {
                        placeMarker(uniqueUnits[i]);
                    }
                }
            }
        }
    }
}
