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
	    var time = unit.timestamp.split("T");
            infoWindow.setContent("<h1>Unit " + unit.device_id + "</h1>" + time[0] + " " + time[1].split(".")[0] + "<h4>Location</h4 ><p>Lat: " + unit.latitude + "<br>Lng: " + unit.longitude + "</p><h4>Sensors</h4 ><p>Temperature: " + unit.temp + "°C</p></div>");
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
