import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';
import { Offcanvas, Tab, Popover } from 'bootstrap';
import L from "leaflet";
import { App } from './app';
import { DBSingleMapRoad } from './dbsingleroad';
import { SingleMapRoad } from './singleroad';
import { DBStationMapMarker } from './dbstationmarker';
import { LogNotify } from './lognotify';
import { TrainCard } from './traincard';

export class ElevationChart {
    private static ctx: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("elevationChart");
    private static elevationChartElement = document.getElementById("offcanvasElevation");
    private static offcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasElevation"));
    private static visualTab: Tab = new Tab(document.getElementById("elevationVisualTab"));
    private static railName: HTMLElement = document.getElementById("offcanvasRailName");
    private static dataHeight: HTMLElement = document.getElementById("dataHeight");
    private static dataMass: HTMLElement = document.getElementById("dataMass");
    private static dataEnergy: HTMLElement = document.getElementById("dataEnergy");
    private static reverseTrackButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("reverseTrackButton");
    private static calculateConsumptionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("calculateConsumptionButton");
    private static trainCards: TrainCard[];
    private static trainCardHolder: HTMLElement = document.getElementById("trainCardHolder");
    private static stationListTabButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("stationListTab");
    private static stationBreadcrumbs: HTMLElement = document.getElementById("stationBreadcrumbs");
    private static chartPickerBtn = document.getElementById("chartPickerButton") as HTMLButtonElement;
    private static chartPickerOptions = document.getElementById("chartPickerOptions");
    private mapRoad: SingleMapRoad;
    private warpMethod: Function;
    private points: L.LatLng[];
    private elevation: number[] = [];
    private stations: DBStationMapMarker[];
    private consumptionData: object;
    private data;
    private chart: Chart;
    private chartReversed = false;
    private selectedTrainCard: TrainCard;
    private lazyReRenderInProgress: boolean = false;
    private activeChartCount = 0;
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
        // Reset tab
        ElevationChart.visualTab.show();
        // Reset chartPicker
        ElevationChart.chartPickerBtn.disabled = true;
        ElevationChart.chartPickerBtn.textContent = "Výška (m)";
        // All init methods
        this.RenderChart();
        this.SetupButtons();
        this.AddTrains();
        this.AddContextualInfo();
        this.ChangeReverseButton();
        this.ChangeConsumptionButton();
        this.SetConsumptionData();
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
                // When consumption is calculated, API flips the stations automagically
                if (this.consumptionData === undefined && this.chartReversed)
                    stationOrder = labels.length - 1 - stationOrder;
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

        if (this.consumptionData !== undefined) {
            // Add data from consumption API
            this.data["datasets"].push({
                yAxisID: "ConsumptionY",
                label: "Spotřeba (kWh)",
                data: this.consumptionData["exerted_energy"],
                fill: false,
                borderColor: "#dc3545",
                borderWidth: 3,
                tension: 0.3,
                hidden: false // This one is shown by default
            })
            this.data["datasets"].push({
                yAxisID: "ConsumptionY",
                label: "Rychlost (m/s)",
                data: this.consumptionData["velocity_values"],
                fill: false,
                borderColor: "#dc3545",
                borderWidth: 3,
                tension: 0.3,
                hidden: true
            })
            this.data["datasets"].push({
                yAxisID: "ConsumptionY",
                label: "Zrychlení (m/s/s)",
                data: this.consumptionData["acceleration_values"],
                fill: false,
                borderColor: "#dc3545",
                borderWidth: 3,
                tension: 0.3,
                hidden: true
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
                        },
                        display: this.consumptionData !== undefined ? true : false
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
            if (this.consumptionData !== undefined)
                this.ClickCalculateConsumption();
            else
                this.ReRenderChart();
            this.ChangeReverseButton(!this.chartReversed);
        };

        if (this.mapRoad instanceof DBSingleMapRoad) {
            ElevationChart.calculateConsumptionButton.onclick = () => {
                this.ClickCalculateConsumption();
            };
        } else {
            ElevationChart.calculateConsumptionButton.setAttribute("style", "display: none");
        }
    }

    private ChangeReverseButton(goBack: boolean = true) {
        let buttonName = "Cesta zpět";
        if (!goBack)
            buttonName = "Cesta vpřed";

        ElevationChart.reverseTrackButton.setAttribute("class", "list-group-item list-group-item-primary text-center");
        let buttonIcon = document.createElement("i");
        buttonIcon.setAttribute("class", "bi-arrow-left-right");
        ElevationChart.reverseTrackButton.innerHTML = "";
        ElevationChart.reverseTrackButton.appendChild(buttonIcon);
        ElevationChart.reverseTrackButton.innerHTML += ` ${buttonName}`;
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

    private EnableChartPicker() {
        // Enable the dropdown
        ElevationChart.chartPickerBtn.disabled = false;
        // Change the its text
        ElevationChart.chartPickerBtn.textContent = "[Multigraf]";
        // Clear all previous options
        ElevationChart.chartPickerOptions.innerHTML = "";

        // Add all options
        for (let i = 0; i < this.data["datasets"].length; i++) {
            const ds = this.data["datasets"][i];

            // Create option
            const option = document.createElement("li");
            const optionLink = document.createElement("a");
            if (i <= 1) { // First two graphs get enabled by default
                optionLink.setAttribute("class", "dropdown-item active");
                this.activeChartCount++;
            }
            else
                optionLink.setAttribute("class", "dropdown-item");
            optionLink.setAttribute("href", "#");
            optionLink.textContent = ds.label;
            option.appendChild(optionLink);
            ElevationChart.chartPickerOptions.appendChild(option);

            // Give it switching capability
            option.onclick = () => {
                const isActive = optionLink.classList.contains("active");
                if (isActive) {
                    optionLink.setAttribute("class", "dropdown-item");
                    this.activeChartCount--;
                }
                else {
                    optionLink.setAttribute("class", "dropdown-item active");
                    this.activeChartCount++;
                }
                this.chart.setDatasetVisibility(i, !isActive);
                this.chart.update();

                // Give the dropdown a name, if there is only one dataset being shown
                if (this.activeChartCount == 1) {
                    [...ElevationChart.chartPickerOptions.children].forEach(optionEl => {
                        const optionElLink = optionEl.children[0];
                        if (optionElLink.classList.contains("active")) {
                            ElevationChart.chartPickerBtn.textContent = optionEl.textContent;
                            return;
                        }
                    });
                }
                else
                    ElevationChart.chartPickerBtn.textContent = "[Multigraf]";
            };
        }
    }

    private ClickCalculateConsumption() {
        LogNotify.ToggleThrobber();
        LogNotify.UpdateThrobberMessage("Získávání údajů o spotřebě");
        setTimeout(() => {
            let apiStatus = this.LoadDataFromConsumption();
            if (apiStatus) {
                this.ChangeConsumptionButton(false);
                this.ReRenderChart();
                this.EnableChartPicker();
            } else {
                LogNotify.PushAlert("API pro výpočet spotřeby neodpovídá. Zkuste to znovu později.",
                    undefined, undefined, "danger");
            }
            LogNotify.ToggleThrobber();
        });
    }

    private SetConsumptionData(mass: number = undefined, consumption: number = undefined) {
        if (mass === undefined)
            ElevationChart.dataMass.innerHTML = "- kg";
        else
            ElevationChart.dataMass.innerHTML = `${mass} kg`;

        if (consumption === undefined)
            ElevationChart.dataEnergy.innerHTML = "- kWh";
        else
            ElevationChart.dataEnergy.innerHTML = `${consumption.toFixed(2)} kWh`;
    }

    private LoadDataFromConsumption(): boolean {
        let consumptionJSON = (this.mapRoad as DBSingleMapRoad).CalcConsumption(this.selectedTrainCard, 0.5, this.chartReversed);
        if (consumptionJSON["status"] != "ok")
            return false;
        this.consumptionData = consumptionJSON["Data"];
        this.points = consumptionJSON["Data"]["rail_definition"]["coordinates"].map(coord => new L.LatLng(coord[1], coord[0]));
        this.elevation = consumptionJSON["Data"]["elevation_values"];
        let stationOrders = consumptionJSON["Data"]["rail_definition"]["station_orders"];

        // API sends everything reversed (app always stores it in default direction)
        if (this.chartReversed) {
            this.points.reverse();
            this.elevation.reverse();
            stationOrders.reverse();
        }

        let i = 0;
        if (this.stations !== undefined) {
            this.stations.forEach(station => {
                if (!station.IsIncluded())
                    return;
                station.SetConsumptionOrderIndex(stationOrders[i++]);
            });
        }

        this.SetConsumptionData(
            this.selectedTrainCard.params["mass_locomotive"] + this.selectedTrainCard.params["mass_wagon"],
            this.consumptionData["exerted_energy"][this.consumptionData["exerted_energy"].length - 1]
        );

        return true;
    }

    private ChangeLazyReRender() {
        if (this.lazyReRenderInProgress)
            return;

        this.lazyReRenderInProgress = true;

        let visualTabButton = document.getElementById("elevationVisualTab");
        visualTabButton.addEventListener("click", () => {
            if (this.consumptionData !== undefined)
                this.ClickCalculateConsumption();
            else
                this.ReRenderChart();
            this.lazyReRenderInProgress = false;
        }, { "once": true });
    }

    private AddTrains() {
        ElevationChart.trainCards = [
            new TrainCard(
                "Stadler Tango NF2",
                {
                    "mass_locomotive": 34500,
                    "mass_wagon": 0,
                    "power_limit": 600
                },
                {
                    "Elevation smoothing": 100,
                    "Curve smoothing": 10,
                    "Curve A": 999,
                    "Curve B": 100,
                    "Running a": 2,
                    "Running b": 0.054,
                    "Running c": 0.00034,
                    "Recuperation coefficient": 1,
                    "Comfortable acceleration": 0.98,
                    "Compensation polynomial": null
                },
                "https://upload.wikimedia.org/wikipedia/commons/9/9c/Stadler_Tango_NF2_v_Ostrav%C4%9B_%2804%29.jpg"
            ),
            new TrainCard(
                "Škoda 860",
                {
                    "mass_locomotive": 56000,
                    "mass_wagon": 31490 + 33000,
                    "power_limit": 480
                },
                {
                    "Elevation smoothing": 100,
                    "Curve smoothing": 10,
                    "Curve A": 226.0739452231682,
                    "Curve B": 55.026751900632405,
                    "Running a": 0.706437197926143,
                    "Running b": 0.01899266921470387,
                    "Running c": 0.008283331094691721,
                    "Recuperation coefficient": 0.6998270177197322,
                    "Comfortable acceleration": 0.41725031534778388,
                    "Compensation polynomial": [
                        -1.3169756479815293e-14, 4.271539912516026e-11,
                        -3.874542069136512e-08, 2.677139343735735e-08,
                        0.00962245960144532, 0.619862570600036
                    ]
                },
                "https://upload.wikimedia.org/wikipedia/commons/9/9a/Vuz_860-Horni_Pocernice.jpg"
            )
        ];

        ElevationChart.trainCardHolder.innerHTML = "";

        ElevationChart.trainCards.forEach(t => {
            ElevationChart.trainCardHolder.appendChild(t.GetCardElement());
            t.RegisterToggleAction(() => {
                if (t.GetState())
                    return;
                ElevationChart.trainCards.forEach(otherCard => {
                    otherCard.ToggleCard(false);
                });
                t.ToggleCard(true);
                this.selectedTrainCard = t;
                if (this.consumptionData !== undefined)
                    this.ChangeLazyReRender();
            });
        });

        ElevationChart.trainCards[0].ToggleCard(true);
        this.selectedTrainCard = ElevationChart.trainCards[0];
    }

    private AddContextualInfo() {
        ElevationChart.railName.innerHTML = "";
        ElevationChart.railName.appendChild(document.createTextNode(this.mapRoad.GetListInfo()));
        ElevationChart.dataHeight.innerHTML = `${Math.round(Math.min(...this.elevation))}-${Math.round(Math.max(...this.elevation))} m`;

        if (this.mapRoad instanceof DBSingleMapRoad)
            ElevationChart.stationListTabButton.setAttribute("style", "");
        else {
            ElevationChart.stationListTabButton.setAttribute("style", "display: none");
            return;
        }

        const stationIcon = document.createElement("i");
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
            stationCrumb.appendChild(stationIcon.cloneNode());
            const stationName = ` ${station.GetListInfo()}`;
            stationCrumb.appendChild(document.createTextNode(stationName));

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
                    }, { "once": true });

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
                        this.ChangeLazyReRender();
                    }, { "once": true });

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
            if (Math.abs(this.elevation[i - 1] - elevation[i]) > 10) {
                this.elevation.push(this.elevation[i - 1]);
            } else {
                this.elevation.push(elevation[i]);
            }
        }
    }

    public IsSameMapRoad(mapRoad: SingleMapRoad) {
        return mapRoad === this.mapRoad;
    }
}