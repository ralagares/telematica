// Mapa para registrar las direcciones de residencia y trabajo del paciente
var map = L.map('direcciones', {
    center: [10.980074,-74.804948],
    zoom: 13
});

map.addControl(new L.Control.Fullscreen());
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 18, minZoom: 9,
}).addTo(map);

var myIcon = L.icon({
    iconUrl: 'imagenes/address.png',
    iconSize: [40,40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

var R = '<h1>Residencia</h1>';
var T = '<h1>Trabajo</h1>';

var residenciaMarker = L.marker([10.980074,-74.804948],{icon: myIcon}).bindPopup(R).addTo(map);
var trabajoMarker = L.marker([10.980074,-74.804948],{icon: myIcon}).bindPopup(T).addTo(map);

// Mapa médico: caso particular
var xy1m = document.getElementById("residenciam");
var xy2m = document.getElementById("trabajom");

residenciaMarker.setLatLng(getXY(xy1m.value));
trabajoMarker.setLatLng(getXY(xy2m.value));

var latlngs = [
    residenciaMarker.getLatLng(),
    trabajoMarker.getLatLng()
];
var polyline = L.polyline(latlngs, {color: 'red',weight: 2}).addTo(map);
map.fitBounds(polyline.getBounds());

function getXY(coordenada) {
    var split = coordenada.split("(");
    var data = split[1];
    split = data.split(")");
    var dir = split[0];
    split = dir.split(",");
    lat = parseFloat(split[0]);
    lng = parseFloat(split[1]);
    coordenada = L.latLng(lat,lng);
    return coordenada
}