// Mapa para registrar las direcciones de residencia y trabajo del paciente
var map = L.map('direcciones', {
    center: [10.980074,-74.804948],
    zoom: 13
});

map.addControl(new L.Control.Fullscreen());
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var myIcon = L.icon({
    iconUrl: 'imagenes/address.png',
    iconSize: [40,40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

var R = '<h1>Residencia</h1>';
var T = '<h1>Trabajo</h1>';

var residenciaMarker = L.marker([10.980074,-74.804948],{draggable: true, icon: myIcon}).bindPopup(R).addTo(map);
var trabajoMarker = L.marker([10.980074,-74.804948],{draggable: true, icon: myIcon}).bindPopup(T).addTo(map);

// Mapa asistente
var xy1 = document.getElementById("residencia");
var xy2 = document.getElementById("trabajo");

if (xy1.value != "" && xy2.value != "") {
    residenciaMarker.setLatLng(getXY(xy1.value));
    trabajoMarker.setLatLng(getXY(xy2.value));
}

residenciaMarker.on("move",function(e){
    var residencia = residenciaMarker.getLatLng();
    xy1.value = residencia;
});
trabajoMarker.on("move",function(e){
    var trabajo = trabajoMarker.getLatLng();
    xy2.value = trabajo;
});
residenciaMarker.on("dragend", function(e){
    residenciaMarker.setLatLng(getXY(xy1.value));
})
trabajoMarker.on("dragend",function(e){
    trabajoMarker.setLatLng(getXY(xy2.value));
});

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