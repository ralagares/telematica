// Mapa para registrar las direcciones de residencia y trabajo del paciente
var map = L.map('mapaGeneral', {
    center: [10.980074,-74.804948],
    zoom: 13
});

map.addControl(new L.Control.Fullscreen());
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var negativos = document.getElementById("negativos");
var tratamiento = document.getElementById("tratamiento");
var uci = document.getElementById("uci");
var curadosp = document.getElementById("curadosp");
var muertos = document.getElementById("muertos");

array(negativos.value,"#008000",'<h1>Resultado negativo</h1>','imagenes/markerVerde.png')
array(tratamiento.value,"#DFCC2C",'<h1>En tratamiento</h1>','imagenes/markerAmarillo.png')
array(uci.value,"#EB8205",'<h1>En UCI</h1>','imagenes/markerNaranja.png')
array(curadosp.value,"#E8AAAA",'<h1>Curado</h1>','imagenes/markerRosado.png')
array(muertos.value,"#FF0000",'<h1>Muerto</h1>','imagenes/markerRojo.png')

function array(array,color,popup,icon) {
    var split = array.split(";,")
    for (let k = 0; k < split.length; k++) {   
        var myIcon = L.icon({
            iconUrl: icon,
            iconSize: [40,40],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30],
        });
        var marker = L.marker(getXY(split[k]), {icon: myIcon}).bindPopup(popup).addTo(map);
    }
}

function getXY(coordenada) {
    var split = coordenada.split("(");
    var data = split[1];
    if (data == undefined) {
        return L.latLng(0,0)
    } else {
        split = data.split(")");
        var dir = split[0];
        split = dir.split(",");
        lat = parseFloat(split[0]);
        lng = parseFloat(split[1]);
        coordenada = L.latLng(lat,lng);
        return coordenada
    }
}