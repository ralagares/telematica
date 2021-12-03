var casos = document.getElementById("casos");
casos = casos.value.split(";,");
casos[casos.length-1] = casos[casos.length-1].substring(0,12);

var muertesd = document.getElementById("muertesDias");
muertesd = muertesd.value.split(";,");
muertesd[muertesd.length-1] = muertesd[muertesd.length-1].substring(0,18);
var puntosm = [];
var puntos = [];

for (let k = 0; k < casos.length; k++) {
    //console.log(casos[k])
    var punto = casos[k].split(",");
    let date = new Date(punto[1] + "T17:14:00Z");
    var fecha = date.toString().substring(4,10);
    for (let i = 0; i < muertesd.length; i++) {
        var puntom = muertesd[i].split(",");
        var fecham = puntom[1].substring(4,10);
        var muertesN;
        
        if (fecha == fecham) {
            console.log(fecha, fecham)
            muertesN = parseInt(puntom[0]);
            puntos.push([fecha, parseInt(punto[0]),muertesN])
        } else {
            muertesN = 0;
            puntos.push([fecha, parseInt(punto[0]),muertesN])
        }
    }
}

google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawStacked);

function drawStacked() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Month');
    data.addColumn('number', 'No. Casos');
    data.addColumn('number', 'Muertes');

    var rows = [];
    for (let k = 0; k < puntos.length; k++) {
        rows.push([puntos[k][0],puntos[k][1],puntos[k][2]]);
    }

    data.addRows(rows);

    var options = {
        title: 'Casos registrados por día',
        isStacked: true,
        hAxis: {
            title: 'Fecha'
        },
        vAxis: {
            title: 'Número de casos',
            format: '##'
        }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('lineal'));
    chart.draw(data, options);
}