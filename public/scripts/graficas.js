
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

    var data1 = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Infectados', parseInt(document.getElementById("infectados").value)],
        ['Curados', parseInt(document.getElementById("curados").value)],
        ['Muertes', parseInt(document.getElementById("muertes").value)],
    ]);
    var options1 = {
        title: 'Casos totales'
    };
    var chart1 = new google.visualization.PieChart(document.getElementById('pie1'));
    chart1.draw(data1, options1);

    var data2 = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['En tratamiento casa', parseInt(document.getElementById("casa").value)],
        ['En tratamiento hospital', parseInt(document.getElementById("hospital").value)],
        ['En tratamiento UCI', parseInt(document.getElementById("uci").value)],
    ]);
    var options2 = {
        title: 'Infectados'
    };
    var chart2 = new google.visualization.PieChart(document.getElementById('pie2'));
    chart2.draw(data2, options2);

    var data3 = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Positivos', parseInt(document.getElementById("positivos").value)],
        ['Negativos', parseInt(document.getElementById("negativos").value)],
    ]);
    var options3 = {
        title: 'Resultados'
    };
    var chart3 = new google.visualization.PieChart(document.getElementById('pie3'));
    chart3.draw(data3, options3);

}