// External imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'font-awesome/css/font-awesome.min.css';

import * as L from "leaflet";
import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype['_getIconUrl' as any as keyof L.Icon.Default];
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default
});

import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';
// import { Toast } from "bootstrap";

// Internal imports
import { App } from "./app";
import { MapMarker } from "./mapmarker";
import { MapRoad } from "./maproad";
import { MapLayer } from "./maplayer"
import { GhostMapLayer } from "./ghostmaplayer"
import { MapArea } from "./maparea"

let app = App.Instance;
app.Init(49.86, 15.51, 15);

// First test layer (BODY)
let myPoints = new MapLayer("Moje body #1");

myPoints.AddMapMarker(new MapMarker(new L.LatLng(49.86, 15.511), "This is a popup #1"));
myPoints.AddMapMarker(new MapMarker(new L.LatLng(49.86, 15.512), "This is a popup #2"));
myPoints.AddMapMarker(new MapMarker(new L.LatLng(49.86, 15.513), "This is a popup #3"));
myPoints.AddMapMarker(new MapMarker(new L.LatLng(49.86, 15.514), "This is a popup #4"));

app.AddMapLayer(myPoints);

// Second test layer (CESTY)
let myRoads = new MapLayer("Moje cesty #1");

myRoads.AddMapRoad(new MapRoad([
    new L.LatLng(49.86, 15.511),
    new L.LatLng(49.861, 15.512),
    new L.LatLng(49.86, 15.513),
    new L.LatLng(49.86, 15.514)
]));
myRoads.AddMapRoad(new MapRoad([
    new L.LatLng(49.859, 15.511),
    new L.LatLng(49.859, 15.512),
    new L.LatLng(49.858, 15.513),
    new L.LatLng(49.859, 15.514)
]));

app.AddMapLayer(myRoads);

let apiLayer = new GhostMapLayer("Moje cesty z externího API", "http://api.com/endpoint");
let apiLayer2 = new GhostMapLayer("Moje cesty z externího API 2", "http://api.com/endpoint");
app.AddGhostMapLayer(apiLayer);
app.AddGhostMapLayer(apiLayer2);

// PROSTORY
// let myAreas = new MapLayer([], [], [], "Prostory");

// let mySquare = new MapArea([
//     new L.LatLng(48.531615, 12.060621),
//     new L.LatLng(48.531615, 12.101603),
//     new L.LatLng(48.558746, 12.101603),
//     new L.LatLng(48.558746, 12.060621),
// ], "something");

// app.AddMapLayer(myAreas);
// myAreas.AddMapArea(mySquare);

function CreateChart() {
    const ctx = <HTMLCanvasElement> document.getElementById("elevationChart");

    let data = {
        labels: [
            500,
            50,
            2424,
            14040,
        ],
        datasets: [{
            label: "Výška", // Name the series
            data: [
                500,
                50,
                2424,
                14040,
            ], // Specify the data values array
            coords: [
                [49.86, 15.511],
                [49.861, 15.512],
                [49.86, 15.513],
                [49.86, 15.514]
            ],
            fill: true,
            borderColor: "#2196f3", // Add custom color border (Line)
            backgroundColor: "#2196f3", // Add custom color background (Points and Fill)
            borderWidth: 1 // Specify bar border width
        }]
    }

    var chart = new Chart(ctx, {
        type: "line",
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    enabled: false
                },
                legend: {
                    display: false
                }
            },
            interaction: {
                intersect: false,
                mode: "index"
            },
            onHover: (e) => {
                const canvasPosition = getRelativePosition(e, chart);
                
                const index = chart.scales.x.getValueForPixel(canvasPosition.x);

                // console.log(data["datasets"][0]["data"][index]);
                let coords = data["datasets"][0]["coords"][index];

                let chartMarker = new MapMarker(new L.LatLng(coords[0], coords[1]), "This is a popup #1");
                App.Instance.RenderRogueMarker(chartMarker);
            }
        },
        plugins: [{
            id: "tooltipLine",
            afterDraw: (chart: { tooltip?: any; scales?: any; ctx?: any }) => {
                if (chart.tooltip.opacity === 1) {
                  const { ctx } = chart;
                  const { caretX } = chart.tooltip;
                  const topY = chart.scales.y.top;
                  const bottomY = chart.scales.y.bottom;
        
                  ctx.save();
                  ctx.setLineDash([3, 3]);
                  ctx.beginPath();
                  ctx.moveTo(caretX, topY - 5);
                  ctx.lineTo(caretX, bottomY);
                  ctx.lineWidth = 1;
                  ctx.strokeStyle = "#FFFFFF";
                  ctx.stroke();
                  ctx.restore();
                }
            }
        }]
    });
}

CreateChart();
