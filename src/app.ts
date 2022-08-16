import { MapWindow } from "./mapwindow";
import { MapLayer } from "./maplayer";
import { GhostMapLayer } from "./ghostmaplayer";
import { SingleMapRoad } from "./singleroad";
import { MultiMapRoad } from "./multiroad";
import { ElevationChart } from "./elevationchart";
import { Offcanvas } from "bootstrap";
import * as L from "leaflet";
import * as shapefile from "shapefile";
import proj4 from "proj4";

// http://lepsi-nez-zivot.blogspot.com/2017/08/konverze-s-jtsk-krovak-do-wsg84-gsm-api.html
// https://github.com/proj4js/proj4js
// https://training.gismentors.eu/open-source-gis/knihovny/proj4.html
proj4.defs("EPSG:4326","+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("EPSG:5514","+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +pm=greenwich +units=m +no_defs +towgs84=570.8,85.7,462.8,4.998,1.587,5.261,3.56");

// TS Singleton: https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
export class App {
    private mapWindow: MapWindow;
    private mapLayers: MapLayer[] = [];
    private ghostMapLayers: GhostMapLayer[] = [];
    private activeElevationChart: ElevationChart;
    private sidebarOffcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasNavbar"));
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
        this.SetupGPXLoader();
        this.SetupShapefileLoader();
        // TODO: Dev - remove
        this.sidebarOffcanvas.toggle();   
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
        mapLayer.ListMapEntities();
    }

    public SetElevationChart(points: L.LatLng[], elevation: number[]) {
        if (this.activeElevationChart !== undefined)
            this.activeElevationChart.DestroyChart();
        this.activeElevationChart = new ElevationChart(points, elevation, this.RenderElevationMarker);
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
            
            var badge = document.createElement("span");
            badge.innerHTML = "Ke stažení";
            badge.setAttribute("class", "badge bg-primary rounded-pill");
            
            listItem.appendChild(badge);
            layersList.appendChild(listItem);
        }
    }

    // https://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
    private SetupGPXLoader() {
        let fileInput = document.getElementById("gpxFileInput");
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            let file = target.files[0];
            if (!file)
            return;
            
            let reader = new FileReader();
            reader.onload = (e: Event) => {
                const target = e.target as FileReader;
                let contents = target.result as string;
                let xmlParser = new DOMParser();
                let xmlDoc = xmlParser.parseFromString(contents, "text/xml");

                let rootNode = xmlDoc.getElementsByTagName("trkseg")[0];
                let pointCount = rootNode.childElementCount;
                
                let pointsArr: L.LatLng[] = [];
                let elevArr: number[] = [];
                
                // Note: GPX ze Seznamu obsahuje duplicity
                for (let i = 0; i < pointCount; i++) {
                    let pointLat = rootNode.children[i].getAttribute("lat");
                    let pointLong = rootNode.children[i].getAttribute("lon");
                    pointsArr.push(new L.LatLng(+pointLat, +pointLong));
                    let pointElev = rootNode.children[i].children[0].innerHTML;
                    elevArr.push(+pointElev);
                    // console.log(pointLat, pointLong, pointElev);
                }
                
                let gpxLayer = new MapLayer("Nová GPX vrstva");
                gpxLayer.AddMapRoad(new SingleMapRoad(pointsArr, elevArr, "purple"));
                this.AddMapLayer(gpxLayer);
            };
            reader.readAsText(file);
        }
    }

    private SetupShapefileLoader() {
        let fileInput = document.getElementById("shapefileInput");
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            let file = target.files[0];
            if (!file)
            return;
            
            let reader = new FileReader();
            reader.onload = (e: Event) => {
                const target = e.target as FileReader;               
                let shapefileLayer = new MapLayer("Nová shapefile vrstva");
                let multiPointsArr: L.LatLng[][] = [];
                let multiElevArr: number[][] = [];
                
                shapefile.open(reader.result)
                .then(source => source.read()
                .then(function log(result) {
                    if (result.done) {
                        // pointsArr.sort((a, b) => {
                        //     if (a.lat > b.lat) {
                        //         return 1;
                        //     } else if (a.lat < b.lat) {
                        //         return -1;
                        //     } else {
                        //         return 0;
                        //     }
                        // });

                        shapefileLayer.AddMultiRoad(new MultiMapRoad(multiPointsArr, multiElevArr, "blue"));
                        App.Instance.AddMapLayer(shapefileLayer);
                        return;
                    }
                    
                    // Parse coords to GPS (WSG84)
                    let pointsArr: L.LatLng[] = [];
                    let elevArr: number[] = [];
                    result.value["geometry"]["coordinates"].forEach(coord => {
                        let gpsPoint = proj4("EPSG:5514","EPSG:4326",coord);
                        pointsArr.push(new L.LatLng(gpsPoint[1], gpsPoint[0]));
                        elevArr.push(100); // TODO: Hardcoded; missing data
                    });
                    multiPointsArr.push(pointsArr);
                    multiElevArr.push(elevArr);
                    // let randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);

                    return source.read().then(log);
                }))
                .catch(error => console.error(error.stack));
            };
            reader.readAsArrayBuffer(file);
        }
    }

    // TODO: Used to be private - make unified
    public RenderElevationMarker(point?: L.LatLng) {
        App.Instance.mapWindow.RenderElevationMarker(point);
    }

    public PrepareElevationChart() {

    }
}
