import { MapWindow } from "./mapwindow";
import { MapLayer } from "./maplayer";
import { GhostMapLayer } from "./ghostmaplayer";
import { MapMarker } from "./mapmarker";
import { ElevationChart } from "./elevationchart";
import { Offcanvas } from "bootstrap";

// TS Singleton: https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
export class App {
    private mapWindow: MapWindow;
    private mapLayers: MapLayer[] = [];
    private ghostMapLayers: GhostMapLayer[] = [];
    private activeElevationChart: ElevationChart;
    private sidebarOffcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasNavbar"));
    // private activeElevationMarker: MapMarker;
    private static _instance: App;

    private constructor(){};

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public SetupButtons() {
        document.getElementById("offcanvasNavbarButton").onclick = () => {
            this.sidebarOffcanvas.toggle();
        };
    }

    public Init(centerLat: number, centerLong: number, zoom: number) {
        this.mapWindow = new MapWindow(centerLat, centerLong, zoom);
        this.SetupButtons();        
        this.CheckElevationButtonVisibility();
    }

    public AddMapLayer(mapLayer: MapLayer) {
        this.mapLayers.push(mapLayer);
        this.RenderLayerList();
    }

    public AddGhostMapLayer(ghostMapLayer: GhostMapLayer) {
        this.ghostMapLayers.push(ghostMapLayer);
        this.RenderLayerList();
    }

    private RemoveGhostMapLayer(index: number) {
        this.ghostMapLayers.splice(index, 1);
        this.RenderLayerList();
    }

    private SetActiveInLayerList(index: number, state: boolean) {
        const layers = document.getElementById("layersList").children;

        if (state)
            layers[index].setAttribute("class", "list-group-item list-group-item-dark active");
        else
            layers[index].setAttribute("class", "list-group-item list-group-item-dark");
    }

    public ActivateMapLayer(index: number) {
        let mapLayer = this.mapLayers[index];
        const mapLayerNewState = !mapLayer.GetAndToggleActiveState();
        this.SetActiveInLayerList(index, mapLayerNewState);
        this.mapWindow.RenderMapLayer(this.mapLayers[index], mapLayerNewState);
        this.CheckElevationButtonVisibility();
    }

    public SetElevationChart() {
        console.log("Setting elevation chart");
        if (this.activeElevationChart !== undefined)
            this.activeElevationChart.DestroyChart();
        this.activeElevationChart = new ElevationChart(this.RenderElevationMarker);
    }

    private CheckElevationButtonVisibility() {
        let someActiveLayers = this.mapLayers.some(layer => {
            return layer.GetActiveState();
        });
        if (someActiveLayers)
        {
            document.getElementById("elevationButton").style.display = "";
        }
        else
            document.getElementById("elevationButton").style.display = "none";
    }

    private SetDownloadingInLayerList(index: number) {
        const layers = document.getElementById("layersList").children;
        index += this.mapLayers.length;
        layers[index].setAttribute("class", "list-group-item list-group-item-warning d-flex justify-content-between align-items-center");
        layers[index].children[0].innerHTML = "Stahování...";
    }

    public DownloadGhostLayer(index: number) {
        let ghostLayer = this.ghostMapLayers[index];
        this.SetDownloadingInLayerList(index);
        // this.mapLayers.push(ghostLayer.Download());
        // this.RemoveGhostMapLayer(index);
    }

    private RenderLayerList() {
        const layersList = document.getElementById("layersList");
        layersList.innerHTML = "";

        for (let i = 0; i < this.mapLayers.length; i++) {
            const l = this.mapLayers[i];
            var listItem = document.createElement("a");
            listItem.innerHTML = l.layerName;
            listItem.setAttribute("class", "list-group-item list-group-item-dark");
            listItem.onclick = function() {
                App.Instance.ActivateMapLayer(i);
            };
            listItem.setAttribute("href", "#");
            // listItem.setAttribute("href", `javascript:App.Instance.ActivateMapLayer(${i})`);
            layersList.appendChild(listItem);
        }

        // Non-existent (ghost) layers (Note: external sources)
        for (let i = 0; i < this.ghostMapLayers.length; i++) {
            const g = this.ghostMapLayers[i];
            var listItem = document.createElement("a");
            listItem.innerHTML = g.layerName;
            listItem.setAttribute("class", "list-group-item list-group-item-danger d-flex justify-content-between align-items-center");
            listItem.onclick = function() {
                App.Instance.DownloadGhostLayer(i);
            };
            listItem.setAttribute("href", "#");
            // listItem.setAttribute("href", `javascript:App.Instance.DownloadGhostLayer(${i})`);
            
            var badge = document.createElement("span");
            badge.innerHTML = "Ke stažení";
            badge.setAttribute("class", "badge bg-primary rounded-pill");
            
            listItem.appendChild(badge);
            layersList.appendChild(listItem);
        }
    }

    private RenderElevationMarker(point: L.LatLng) {
        App.Instance.mapWindow.RenderElevationMarker(point);
    }

    public PrepareElevationChart() {

    }
}
