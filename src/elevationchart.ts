import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';
import { Offcanvas } from 'bootstrap';
import * as L from "leaflet";
// import { App } from './app';

export class ElevationChart {
    private static ctx: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("elevationChart");
    private static elevationChartElement = document.getElementById("offcanvasElevation");
    private static offcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasElevation"));
    private points: L.LatLng[];
    private elevation: number[];
    private data;
    private chart: Chart;
    private markerCallback: Function;

    public constructor(points: L.LatLng[], elevation: number[], markerCallback: Function) {
        this.points = points;
        this.elevation = elevation;
        this.markerCallback = markerCallback;
        this.RenderChart();
        this.ShowChart();
        this.RegisterChartClosing();
    }

    private RenderChart() {
        this.data = {
            labels: this.elevation,
            datasets: [{
                label: "Výška", // Name the series
                data: this.elevation, // Specify the data values array
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
                        enabled: true
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
                    let elevationMarkerPos = this.points[index];
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
        this.markerCallback();
        ElevationChart.offcanvas.show();
    }

    private RegisterChartClosing() {
        ElevationChart.elevationChartElement.addEventListener("hidden.bs.offcanvas", () => {
            this.markerCallback();
        }, { once: true });
    }

    public DestroyChart() {
        this.chart.destroy();
    }
}