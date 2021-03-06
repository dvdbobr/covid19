var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: "world confirmed",
        datasets: [{
            label: currentChartData.labelArr,
            data: currentChartData.dataArr,
            backgroundColor: [
                getColor(),
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            labels: {
                fontColor: 'black',
                fontSize: 20,
                fontFamily:"Varela Round,Arial,sans-serif"
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    fontColor: 'black',
                    fontSize: 18,
                    fontFamily: "Varela Round,Arial,sans-serif"
                }
            }],
            xAxes: [{
                ticks: {
                    fontColor: 'black',
                    fontSize: 12,
                    fontFamily: "Varela Round,Arial,sans-serif"
                }
            }]
        }
    }
});

var ctx2 = document.getElementById('bar').getContext('2d');
var bar = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: ["Asia", "Europe", "Africa", "Americas"],
        datasets: [{
            label: currentStatus + " in " + currentContinent,
            data: currentChartData.dataArr,
            backgroundColor: [
                getColor(),
                getColor(),
                getColor(),
                getColor(),
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            labels: {
                fontColor: 'black',
                fontSize: 20,
                fontFamily:"Varela Round,Arial,sans-serif"
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    fontColor: 'black',
                    fontSize: 18,
                    fontFamily: "Varela Round,Arial,sans-serif"
                }
            }],
            xAxes: [{
                ticks: {
                    fontColor: 'black',
                    fontSize: 18,
                    fontFamily: "Varela Round,Arial,sans-serif"
                }
            }]
        }
    }
});

function getColor() {
    let red = Math.floor(Math.random() * 256);
    let green = Math.floor(Math.random() * 256);
    let blue = Math.floor(Math.random() * 256);
    return `rgba(${red},${green},${blue}, 0.6)`
}