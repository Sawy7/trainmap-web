import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';
import { Offcanvas, Tab } from 'bootstrap';
import L from "leaflet";
import { App } from './app';

export class ElevationChart {
    private static ctx: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("elevationChart");
    private static elevationChartElement = document.getElementById("offcanvasElevation");
    private static offcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasElevation"));
    private static visualTab: Tab = new Tab(document.getElementById("elevationVisualTab"));
    private points: L.LatLng[];
    private elevation: number[];
    private data;
    private chart: Chart;
    readonly layerID: number;

    public constructor(points: L.LatLng[], elevation: number[], layerID: number) {
        this.points = points;
        // Fix sudden dips (errors in data)
        this.elevation = elevation.map((e) => {
            if (e == 0)
                return undefined;
            else
                return e;
        });
        this.layerID = layerID;
        ElevationChart.visualTab.show();
        this.RenderChart();
        this.ShowChart();
        this.RegisterChartClosing();
    }

    private RenderChart() {
        let consumption = this.CalculateConsumption();
        let labels: string[] = [];
        let radius: number[] = [];
        for (let i = 0; i < this.elevation.length; i++) {
            if (i % 100 == 0) {
                labels.push("Stanice: " + i.toString());
                radius.push(2);
            }
            else {
                labels.push("");
                radius.push(0);
            }
        }

        this.data = {
            labels: labels,
            datasets: [
                {
                    label: "Výška (m)", // Name the series
                    data: this.elevation, // Specify the data values array
                    fill: false,
                    borderColor: "#2196f3", // Add custom color border (Line)
                    borderWidth: 3 // Specify bar border width
                },
                {
                    label: "Spotřeba (kW)",
                    data: consumption,
                    fill: false,
                    borderColor: "#dc3545",
                    borderWidth: 3,
                    tension: 0.3
                }
            ]
        }

        this.chart = new Chart(ElevationChart.ctx, {
            type: "line",
            data: this.data,
            options: {
                spanGaps: true,
                normalized: true,
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    point: {
                        radius: radius
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        ticks: { color: "white" }
                    }
                },
                plugins: {
                    // tooltip: {
                    //     enabled: true,
                    //     callbacks: {
                    //         title: (items) => {return ""}
                    //     }
                    // },
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
                    App.Instance.RenderElevationMarker(elevationMarkerPos);
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
        App.Instance.RenderElevationMarker();
        ElevationChart.offcanvas.show();
    }

    public HideChart() {
        ElevationChart.offcanvas.hide();
    }

    public CheckUIVisible(): boolean {
        return ElevationChart.elevationChartElement.classList.contains("show");
    }
    
    private RegisterChartClosing() {
        ElevationChart.elevationChartElement.addEventListener("hidden.bs.offcanvas", () => {
            App.Instance.RenderElevationMarker();
        }, { once: true });
    }
    
    public DestroyChart() {
        this.chart.destroy();
    }

    private CalculateConsumption(): number[] {
        // TODO: This is a stub
        let con: number[] = [];
        // this.elevation.forEach(element => {
        //     con.push(element-80);
        // });
        con.push(0);
        for (let i = 0; i < 10; i++) {
            con.push(undefined);
        }
        con.push(100);
        for (let i = 0; i < 76; i++) {
            con.push(undefined);
        }
        con.push(100);
        for (let i = 0; i < 10; i++) {
            con.push(undefined);
        }
        con.push(0);
        
        return con;
    }
}