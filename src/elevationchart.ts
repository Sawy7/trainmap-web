import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';
import { Offcanvas } from 'bootstrap';
import * as L from "leaflet";
// import { App } from './app';

export class ElevationChart {
    private static ctx: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("elevationChart");
    private static offcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasElevation"));
    private data;
    private chart: Chart;
    private markerCallback: Function;

    public constructor(markerCallback: Function) {
        this.markerCallback = markerCallback;
        this.RenderChart();
        this.ShowChart();
    }

    private RenderChart() {
        this.data = {
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

        this.chart = new Chart(ElevationChart.ctx, {
            type: "line",
            data: this.data,
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
                    const canvasPosition = getRelativePosition(e, this.chart);
                    const index = this.chart.scales.x.getValueForPixel(canvasPosition.x);
                    let coords = this.data["datasets"][0]["coords"][index];
                    let elevationMarkerPos = new L.LatLng(coords[0], coords[1]);
                    this.markerCallback(elevationMarkerPos);
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

    private ShowChart() {
        console.log("showing");
        ElevationChart.offcanvas.show();
    }

    public DestroyChart() {
        this.chart.destroy();
        console.log("cleared");
    }
}