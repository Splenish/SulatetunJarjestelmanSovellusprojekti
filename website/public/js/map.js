//Fetch data passed from Express
var units = JSON.parse(document.getElementById("mapScript").getAttribute("data-units")).units;
var map;
var markers = {};

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

    var icon = "/images/front_1.png";

    //Setup markers
    for (var i = 0; i < units.length; i++) {
        markers[i] = new google.maps.Marker({
            position: units[i],
            map: map,
            icon: icon
        });
    }
}