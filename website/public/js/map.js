//Fetch data passed from Express
var units = JSON.parse(document.getElementById("mapScript").getAttribute("data-units"));
var map;
var infoWindow;
var markers = [];

//Places a marker on the map using units information and attaches a infoWindow on click
function placeMarker(unit) {
    var latLng = new google.maps.LatLng(unit.lat, unit.lng);
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
      icon: icon
    });
    google.maps.event.addListener(marker, 'click', function(){
        infoWindow.close();
        infoWindow.setContent( "<div><h1>Unit "+ unit.id +"</h1><h4>Location</h4 ><p>Lat: " + unit.lat + "<br>Lng: " + unit.lng + "</p></div>");
        infoWindow.open(map, marker);
    });
    markers.push(marker);
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
                    if (units[mark].status == "offline") {
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
                        if (units[mark].status == "online") {
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
                if (units[mark].status == "offline") {
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
                if (units[mark].status == "online") {
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
    //Calculate the center to focus the map on and calculate zoom
    var latLngList = [];
    var center = {lat: 0, lng: 0};
    for (var i = 0; i < units.length; i++) {
        center.lat += units[i].lat;
        center.lng += units[i].lng;
        latLngList.push(new google.maps.LatLng(units[i].lat, units[i].lng));
    }
    center.lat /= units.length;
    center.lng /= units.length;

    var bounds = new google.maps.LatLngBounds();
    latLngList.forEach(function(n) {
        bounds.extend(n);
    });

    //Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: center
    });

    infoWindow = new google.maps.InfoWindow();

    map.fitBounds(bounds);

    //Setup markers with info windows
    for (var i = 0; i < units.length; i++) {
        placeMarker(units[i]);
    }

    var legend = document.getElementById("offlineLegend");
    legend.setAttribute('onclick',"filterMarker(0)");
    legend = document.getElementById("onlineLegend");
    legend.setAttribute('onclick',"filterMarker(1)");
}