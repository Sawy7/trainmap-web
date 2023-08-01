import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';
import { Offcanvas, Tab, Popover } from 'bootstrap';
import L from "leaflet";
import { App } from './app';
import { DBSingleMapRoad } from './dbsingleroad';
import { SingleMapRoad } from './singleroad';
import { DBStationMapMarker } from './dbstationmarker';
import { LogNotify } from './lognotify';

export class ElevationChart {
    private static ctx: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("elevationChart");
    private static elevationChartElement = document.getElementById("offcanvasElevation");
    private static offcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasElevation"));
    private static visualTab: Tab = new Tab(document.getElementById("elevationVisualTab"));
    private static railName: HTMLElement = document.getElementById("offcanvasRailName");
    private static elevationChartDiv: HTMLDivElement = <HTMLDivElement> document.getElementById("elevationChartDiv");
    private static elevationChartHeading: HTMLElement = document.getElementById("elevationChartHeading");
    private static dataHeight: HTMLElement = document.getElementById("dataHeight");
    private static reverseTrackButton: HTMLButtonElement = <HTMLButtonElement> document.getElementById("reverseTrackButton");
    private static calculateConsumptionButton: HTMLButtonElement = <HTMLButtonElement> document.getElementById("calculateConsumptionButton");
    private static stationListTabButton: HTMLButtonElement = <HTMLButtonElement> document.getElementById("stationListTab");
    private static stationBreadcrumbs: HTMLElement = document.getElementById("stationBreadcrumbs");
    private mapRoad: SingleMapRoad;
    private warpMethod: Function;
    private points: L.LatLng[];
    private elevation: number[] = [];
    private stations: DBStationMapMarker[];
    private consumption: number[];
    private data;
    private chart: Chart;
    private chartReversed = false;
    readonly layerID: number;

    public constructor(mapRoad: SingleMapRoad, warpMethod: Function) {
        this.mapRoad = mapRoad;
        this.warpMethod = warpMethod;
        this.points = (this.mapRoad.GetPoints() as L.LatLng[]);
        this.FilterDrops((this.mapRoad.GetElevation() as number[]));
        this.elevation = (this.mapRoad.GetElevation() as number[]);
        this.layerID = this.mapRoad.GetLayerID();
        if (this.mapRoad instanceof DBSingleMapRoad)
            this.stations = this.mapRoad.GetStations();
        ElevationChart.visualTab.show();
        this.RenderChart();
        this.SetupButtons();
        this.AddContextualInfo();
        this.ChangeConsumptionButton();
        this.ShowChart();
        this.RegisterChartClosing();
    }

    private RenderChart() {
        let labels: string[] = [];
        let radius: number[] = [];

        let localElevation = [...this.elevation];
        let localPoints = [...this.points];
        if (this.chartReversed) {
            localElevation.reverse();
            localPoints.reverse();
        }

        for (let i = 0; i < localElevation.length; i++) {
            labels.push("");
            radius.push(0);
        }

        if (this.stations !== undefined) {
            this.stations.forEach(station => {
                if (!station.IsIncluded())
                    return;
                let stationOrder = station.GetOrderIndex(); 
                if (this.chartReversed)
                    stationOrder = labels.length-1-stationOrder;
                labels[stationOrder] = station.GetListInfo();
                radius[stationOrder] = 5;
            });
        }

        this.data = {
            labels: labels,
            datasets: [
                {
                    yAxisID: "ElevationY",
                    label: "Výška (m)", // Name the series
                    data: localElevation, // Specify the data values array
                    fill: false,
                    borderColor: "#2196f3", // Add custom color border (Line)
                    borderWidth: 3 // Specify bar border width
                },
            ]
        }

        if (this.consumption !== undefined) {
            this.data["datasets"].push({
                yAxisID: "ConsumptionY",
                label: "Spotřeba (J)",
                data: this.consumption,
                fill: false,
                borderColor: "#dc3545",
                borderWidth: 3,
                tension: 0.3
            })
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
                        display: false
                    },
                    ConsumptionY: {
                        position: "right",
                        ticks: {
                            color: "#dc3545"
                        }
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
                    // console.log(index);
                    let elevationMarkerPos = localPoints[index];
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

    private ReRenderChart() {
        this.DestroyChart();
        this.RenderChart();
    }

    private SetupButtons() {
        ElevationChart.reverseTrackButton.onclick = () => {
            this.chartReversed = !this.chartReversed;
            if (this.consumption !== undefined)
                this.ClickCalculateConsumption();
            else
                this.ReRenderChart();
        };

        if (this.mapRoad instanceof DBSingleMapRoad) {
            ElevationChart.calculateConsumptionButton.onclick = () => {
                this.ClickCalculateConsumption();
            };
        } else {
            ElevationChart.calculateConsumptionButton.setAttribute("style", "display: none");
        }
    }

    private ChangeConsumptionButton(freshButton: boolean = true) {
        let commonClasses = "list-group-item text-center";
        let buttonName = "Spotřeba";
        if (freshButton)
            commonClasses += " list-group-item-primary";
        else {
            commonClasses += " list-group-item-warning";
            buttonName = "Přepočítat";
        }
        ElevationChart.calculateConsumptionButton.setAttribute("class", commonClasses);
        let buttonIcon = document.createElement("i");
        buttonIcon.setAttribute("class", "bi-calculator-fill");
        ElevationChart.calculateConsumptionButton.innerHTML = "";
        ElevationChart.calculateConsumptionButton.appendChild(buttonIcon);
        ElevationChart.calculateConsumptionButton.innerHTML += ` ${buttonName}`;
    }

    private ClickCalculateConsumption() {
        LogNotify.ToggleThrobber();
        LogNotify.UpdateThrobberMessage("Získávání údajů o spotřebě");
        setTimeout(() => {
            if (this.consumption === undefined)
                this.ChangeConsumptionButton(false);
            this.LoadDataFromConsumption();
            this.ReRenderChart();
            LogNotify.ToggleThrobber();
        });
    }

    private LoadDataFromConsumption() {
        let consumptionJSON = (this.mapRoad as DBSingleMapRoad).CalcConsumption(this.chartReversed);
        this.consumption = consumptionJSON["Data"]["exerted_energy"];
        this.points = consumptionJSON["Data"]["coordinates"].map(coord => new L.LatLng(coord[1], coord[0]));
        this.elevation = consumptionJSON["Data"]["elevation_values"];
        let stationOrders = consumptionJSON["Data"]["station_orders"];

        if (this.chartReversed) {
            this.points.reverse();
            this.elevation.reverse();
            stationOrders = stationOrders.map(order => this.points.length-1-order);
        }

        let i = 0;
        if (this.stations !== undefined) {
            this.stations.forEach(station => {
                if (!station.IsIncluded())
                    return;
                station.SetOrderIndex(stationOrders[i++]);
            });
        }
    }

    private AddContextualInfo() {
        ElevationChart.railName.innerHTML = this.mapRoad.GetListInfo();
        ElevationChart.dataHeight.innerHTML = `${Math.round(Math.min(...this.elevation))}-${Math.round(Math.max(...this.elevation))} m`; 

        if (this.mapRoad instanceof DBSingleMapRoad)
            ElevationChart.stationListTabButton.setAttribute("style", "");
        else {
            ElevationChart.stationListTabButton.setAttribute("style", "display: none");
            return;
        }

        let stationIcon = document.createElement("i");
        stationIcon.setAttribute("class", "bi bi-train-front-fill");
        ElevationChart.stationBreadcrumbs.innerHTML = "";
        this.stations.forEach(station => {
            let stationCrumb = document.createElement("a");
            stationCrumb.setAttribute("href", "#");
            stationCrumb.setAttribute("class", "breadcrumb-item");
            stationCrumb.setAttribute("title", "Title");
            stationCrumb.setAttribute("data-popover-content", "popoverContent");
            if (!station.IsIncluded())
                stationCrumb.setAttribute("style", "color: var(--bs-red)");
            stationCrumb.appendChild(stationIcon);
            stationCrumb.innerHTML += ` ${station.GetListInfo()}`;

            new Popover(stationCrumb, {
                "placement": "auto",
                "trigger": "focus",
                "html": true,
                "title": station.GetListInfo(),
                "content": () => {
                    let buttons = document.createElement("div");
                    buttons.setAttribute("class", "list-group");

                    let showOnMapButton = document.createElement("a");
                    showOnMapButton.setAttribute("class", "btn btn-primary");
                    showOnMapButton.innerHTML = "<i class='bi bi-geo-alt-fill'></i> Zobrazit na mapě";
                    showOnMapButton.addEventListener("click", () => {
                        this.warpMethod(station.GetSignificantPoint());
                    }, {"once": true});

                    buttons.appendChild(showOnMapButton);

                    let includeButton = document.createElement("a");
                    if (station.IsIncluded()) {
                        includeButton.setAttribute("class", "btn btn-danger");
                        includeButton.innerHTML = "<i class='bi bi-x'></i> Vynechat z grafu";
                    }
                    else {
                        includeButton.setAttribute("class", "btn btn-success");
                        includeButton.innerHTML = "<i class='bi bi-check'></i> Zahrnout v grafu";
                    }
                    includeButton.addEventListener("click", () => {
                        let newState = station.ToggleIncluded();
                        if (newState)
                            stationCrumb.setAttribute("style", "");
                        else
                            stationCrumb.setAttribute("style", "color: var(--bs-red)");
                        
                        // Setup re-render of graph
                        let visualTabButton = document.getElementById("elevationVisualTab"); 
                        visualTabButton.addEventListener("click", () => {
                            this.ReRenderChart();
                        }, {"once": true});
                    }, {"once": true});

                    buttons.appendChild(includeButton);
                    return buttons;
                }
            });
            ElevationChart.stationBreadcrumbs.appendChild(stationCrumb);
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

    private FilterDrops(elevation: number[]) {
        this.elevation.push(elevation[0]);
        for (let i = 1; i < elevation.length; i++) {
            if (Math.abs(this.elevation[i-1] - elevation[i]) > 10) {
                this.elevation.push(this.elevation[i-1]);
                // console.log("bonk", Math.abs(this.elevation[i-1] - elevation[i]));
            } else {
                this.elevation.push(elevation[i]);
            }
        }
    }

    private CalculateConsumption(): number[] {
        // TODO: This is a stub
        let stationIndexes = [0, 193, 329, 373, 430, 584, 682, 794, 942, this.points.length-1];
        let con: number[] = [];
        let jetOffset = 10;

        let currentStation = 0;
        for (let i = 0; i < this.points.length; i++) {
            if (i == stationIndexes[currentStation]) {
                // going down
                if (i != stationIndexes[0]) {
                    for (let j = 0; j < jetOffset; j++) {
                        con.pop();
                    }
                    let half = Math.floor(jetOffset/2);
                    con = con.concat(new Array(half).fill(undefined));
                    con.push(-20);
                    con = con.concat(new Array(jetOffset-half-1).fill(undefined));
                }
                // going up
                con.push(0);
                if (i != stationIndexes[stationIndexes.length-1]) {
                    let half = Math.floor(jetOffset/2);
                    con = con.concat(new Array(half).fill(undefined));
                    con.push(this.elevation[i]-100);
                    con = con.concat(new Array(jetOffset-half-1).fill(undefined));
                    i+=jetOffset;
                }
                currentStation++;
            }
            else {
                con.push(this.elevation[i]-190);
            } 
        }
        return con;
    }

    public IsSameMapRoad(mapRoad: SingleMapRoad) {
        return mapRoad === this.mapRoad;
    }
}