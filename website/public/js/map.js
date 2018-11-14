//Fetch data passed from Express
var units = JSON.parse(document.getElementById("mapScript").getAttribute("data-units"));
var map;
var markers = [];
var infoWindows = [];

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

    map.fitBounds(bounds);

    var icons = [];
    for (var i = 0; i < 2; i++) {
        icons[i] = "/images/unit_icon" + i + ".png"; 
    }

    //Setup markers with info windows
    for (var i = 0; i < units.length; i++) {
        markers[i] = new google.maps.Marker({
            position: units[i],
            map: map,
            icon: icons[i%icons.length]
        });
        infoWindows[i] = new google.maps.InfoWindow({
            content: "Test window data"
        });
        var marker = markers[i];
        google.maps.event.addListener(marker, 'click', function() {
            infoWindows[i].open(map, this);
        });
    }
}