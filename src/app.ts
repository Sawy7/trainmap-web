import L from "leaflet";
import { Offcanvas, Collapse } from "bootstrap";

import { MapWindow } from "./mapwindow";
import { MapLayer } from "./maplayer";
import { DBMapLayer } from "./dblayer";
import { DBLayerBuilder } from "./dblayerbuilder";
import { ElevationChart } from "./elevationchart";
import { FileLoader } from "./fileloader";
import { MapEntityFactory } from "./mapentityfactory";
import { LayerList } from "./layerlist";
import { LogNotify } from "./lognotify";
import { SingleMapRoad } from "./singleroad";

// TS Singleton: https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
export class App {
    private mapWindow: MapWindow;
    private localLayers: MapLayer[] = [];
    private layerList: LayerList;
    private activeElevationChart: ElevationChart;
    private sidebarOffcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasNavbar"));
    private layerActivating: boolean = false;
    private static _instance: App;

    private constructor(){};

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public SetupButtons() {
        document.getElementById("offcanvasNavbarButton").onclick = () => {
            this.sidebarOffcanvas.toggle();
        };

        DBLayerBuilder.SetInteraction();
    }

    public Init(centerLat: number, centerLong: number, zoom: number) {
        this.mapWindow = new MapWindow(centerLat, centerLong, zoom);
        this.SetupButtons();
        this.InitLayerList();
        LogNotify.Init();
        FileLoader.SetupGPXLoader();
        FileLoader.SetupShapefileLoader();
    }

    private InitLayerList() {
        this.layerList = LayerList.Instance;
        this.layerList.Init(
            this.ActivateMapLayer.bind(this),
            this.mapWindow.WarpToPoint.bind(this.mapWindow),
            this.RemoveMapLayer.bind(this),
        );
    }

    private RemoveMapLayer(mapLayer: MapLayer) {
        let layerIndex = this.localLayers.indexOf(mapLayer);
        if (layerIndex != -1) {
            this.localLayers.splice(layerIndex, 1);
        }

        if (mapLayer instanceof DBMapLayer)
            mapLayer.RemoveFromLocalStorage();
    }

    public AddMapLayer(mapLayer: MapLayer, notFromStorage: boolean = true) {
        this.localLayers.push(mapLayer);
        this.layerList.AddLayer(mapLayer);

        if (mapLayer instanceof DBMapLayer && notFromStorage)
            (mapLayer as DBMapLayer).SaveToLocalStorage();
    }

    private ActivateMapLayer(mapLayer: MapLayer, collapseElement: HTMLElement) {
        if (this.layerActivating)
            return;
        this.layerActivating = true;

        const mapLayerNewState = !mapLayer.GetAndToggleActiveState();
        this.mapWindow.RenderMapLayer(mapLayer, mapLayerNewState);
        
        if (this.activeElevationChart !== undefined && !mapLayerNewState && this.activeElevationChart.layerID == mapLayer.id)
        this.activeElevationChart.HideChart();

        let collapse = new Collapse(collapseElement);
        collapse.toggle();

        let collapseEvent: string;
        if (mapLayerNewState)
            collapseEvent = "shown.bs.collapse";
        else
            collapseEvent = "hidden.bs.collapse";            
        
        collapseElement.addEventListener(collapseEvent, () => {
            this.layerActivating = false;
        }, { once: true });
    }

    public SetElevationChart(mapRoad: SingleMapRoad) {
        if (this.activeElevationChart !== undefined) {
            if (this.activeElevationChart.layerID == mapRoad.GetLayerID() && this.activeElevationChart.CheckUIVisible())
                return;
            
            this.activeElevationChart.DestroyChart();
            this.activeElevationChart = undefined;
        }
        this.activeElevationChart = new ElevationChart(mapRoad);
    }

    public LoadFromLocalStorage() {
        if (localStorage["dblayers"] === undefined)
            return;

        let storageList = JSON.parse(localStorage["dblayers"]);
        for (let i = 0; i < storageList.length; i++) {
            storageList[i]["id"] = i; // Refreshing indexes (so they always stay low)
            let layer = MapEntityFactory.CreateGhostDBMapLayer(
                storageList[i]["name"], storageList[i]["elements"],
                storageList[i]["color"], storageList[i]["id"]
            );
            this.AddMapLayer(layer, false);
        }
        
        localStorage["dblayers"] = JSON.stringify(storageList); // Updating with refreshed indexes
    }

    public RenderElevationMarker(point?: L.LatLng) {
        App.Instance.mapWindow.RenderElevationMarker(point);
    }

    public SaveTextToDisk(text: string, filename: string, type: string = "text/plain") {
        let data = new Blob([text], {type: "text/plain"});
        let link = window.URL.createObjectURL(data);
        this.DownloadLink(link, filename);
        window.URL.revokeObjectURL(link);
    }

    // https://stackoverflow.com/questions/11620698/how-to-trigger-a-file-download-when-clicking-an-html-button-or-javascript
    private DownloadLink(link: string, filename: string) {
        const a = document.createElement("a");
        a.href = link;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
