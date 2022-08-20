import { MapWindow } from "./mapwindow";
import { MapLayer } from "./maplayer";
// import { GhostMapLayer } from "./ghostmaplayer";
import { SingleMapRoad } from "./singleroad";
import { MultiMapRoad } from "./multiroad";
import { ElevationChart } from "./elevationchart";
import { FileLoader } from "./fileloader";
import { Offcanvas, Collapse, Modal } from "bootstrap";
import * as L from "leaflet";
import * as shp from "shpjs";
// import proj4 from "proj4";

// http://lepsi-nez-zivot.blogspot.com/2017/08/konverze-s-jtsk-krovak-do-wsg84-gsm-api.html
// https://github.com/proj4js/proj4js
// https://training.gismentors.eu/open-source-gis/knihovny/proj4.html
// proj4.defs("EPSG:4326","+proj=longlat +datum=WGS84 +no_defs");
// proj4.defs("EPSG:5514","+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +pm=greenwich +units=m +no_defs +towgs84=570.8,85.7,462.8,4.998,1.587,5.261,3.56");

// TS Singleton: https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
export class App {
    private mapWindow: MapWindow;
    private mapLayers: MapLayer[] = [];
    // private ghostMapLayers: GhostMapLayer[] = [];
    private activeElevationChart: ElevationChart;
    private sidebarOffcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasNavbar"));
    private fileLoader: FileLoader = new FileLoader();
    private static _instance: App;

    private constructor(){};

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public SetupButtons() {
        document.getElementById("offcanvasNavbarButton").onclick = () => {
            this.sidebarOffcanvas.toggle();
        };

        document.getElementById("logModalSaveButton").onclick = () => {
            this.SaveLogToDisk();
        };
    }

    public Init(centerLat: number, centerLong: number, zoom: number) {
        this.mapWindow = new MapWindow(centerLat, centerLong, zoom);
        this.SetupButtons();
        this.SetupGPXLoader();
        this.SetupShapefileLoader();
        this.AddKeyListener();
        // TODO: Dev - remove
        this.sidebarOffcanvas.toggle();
    }

    public AddMapLayer(mapLayer: MapLayer) {
        this.mapLayers.push(mapLayer);
        // this.RenderLayerList();
        this.AddToLayerList();
    }

    // public AddGhostMapLayer(ghostMapLayer: GhostMapLayer) {
    //     this.ghostMapLayers.push(ghostMapLayer);
    //     this.RenderLayerList();
    // }

    // private RemoveGhostMapLayer(index: number) {
    //     this.ghostMapLayers.splice(index, 1);
    //     this.RenderLayerList();
    // }

    private PopulateLayerEntitesList(index: number, mapLayer: MapLayer) {
        // const layers = document.getElementById("layersList").children;
        // console.log(index)

        // if (state)
        //     layers[index].setAttribute("class", "list-group-item list-group-item-dark active");
        // else
        //     layers[index].setAttribute("class", "list-group-item list-group-item-dark");

        let entitiesList = document.getElementById("layer_"+index).children[0].children[1];
        if (entitiesList.innerHTML !== "")
            return;
        let mapEntities = mapLayer.GetLayerEntities();
        mapEntities.forEach(ma => {
            var entityLink = document.createElement("a");
            entityLink.setAttribute("class", "list-group-item list-group-item-dark d-flex justify-content-between align-items-center");
            entityLink.setAttribute("href", "#");
            let significantPoint = ma.GetSignificantPoint();
            entityLink.innerHTML = `${ma.GetListInfo()} (${significantPoint.lat}, ${significantPoint.lng})`;
            entityLink.onclick = () => {
                this.mapWindow.WarpToPoint(significantPoint);
            };
            var badge = document.createElement("span");
            var locateIcon = document.createElement("i");
            locateIcon.setAttribute("class", "bi-pin-map-fill")
            badge.appendChild(locateIcon);
            badge.setAttribute("class", "badge bg-primary rounded-pill");
            entityLink.appendChild(badge);
            entitiesList.appendChild(entityLink);
        });
    }

    public ActivateMapLayer(index: number, soft: boolean = false) {
        new Collapse(document.getElementById("layer_"+index)).toggle();
        if (soft)
            return;

        let mapLayer = this.mapLayers[index];
        const mapLayerNewState = !mapLayer.GetAndToggleActiveState();
        this.mapWindow.RenderMapLayer(this.mapLayers[index], mapLayerNewState);
        // this.SetActiveInLayerList(index, mapLayer, mapLayerNewState);

        if (this.activeElevationChart !== undefined && !mapLayerNewState && this.activeElevationChart.layerName == mapLayer.layerName)
            this.activeElevationChart.HideChart();
    }

    public SetElevationChart(points: L.LatLng[], elevation: number[], layerName: string) {
        if (this.activeElevationChart !== undefined)
            this.activeElevationChart.DestroyChart();
        this.activeElevationChart = new ElevationChart(points, elevation, layerName);
    }

    // private SetDownloadingInLayerList(index: number) {
    //     const layers = document.getElementById("layersList").children;
    //     index += this.mapLayers.length;
    //     layers[index].setAttribute("class", "list-group-item list-group-item-warning d-flex justify-content-between align-items-center");
    //     layers[index].children[0].innerHTML = "Stahování...";
    // }

    // public DownloadGhostLayer(index: number) {
    //     let ghostLayer = this.ghostMapLayers[index];
    //     this.SetDownloadingInLayerList(index);
    //     // this.mapLayers.push(ghostLayer.Download());
    //     // this.RemoveGhostMapLayer(index);
    // }

    // // TODO: This potentially runs too many times
    // private RenderLayerList() {
    //     const layersList = document.getElementById("layersList");
    //     layersList.innerHTML = "";

    //     for (let i = 0; i < this.mapLayers.length; i++) {
    //         const l = this.mapLayers[i];

    //         // Accordions
    //         var accordion = document.createElement("a");
    //         accordion.setAttribute("class", "list-group-item list-group-item-dark d-flex justify-content-between align-items-center");
    //         accordion.setAttribute("href", "#");
    //         accordion.innerHTML = l.layerName;

    //         var accordionCollapse = document.createElement("div");
    //         accordionCollapse.setAttribute("class", "accordion-collapse collapse bg-secondary");
    //         accordionCollapse.setAttribute("id", "layer_"+i);
    //         accordion.onclick = () => {
    //             this.ActivateMapLayer(i);
    //         };

    //         var accordionBody = document.createElement("div");
    //         accordionBody.setAttribute("class", "accordion-body");

    //         var routesHeader = document.createElement("h7");
    //         routesHeader.innerHTML = "Elementy vrstvy";
    //         accordionBody.appendChild(routesHeader);

    //         var entityList = document.createElement("div");
    //         accordionBody.appendChild(entityList);

    //         accordionCollapse.appendChild(accordionBody);

    //         var badge = document.createElement("span");
    //         badge.innerHTML = "XY";
    //         badge.setAttribute("class", "badge bg-primary rounded-pill");
    //         accordion.appendChild(badge);

    //         layersList.appendChild(accordion);
    //         layersList.appendChild(accordionCollapse);

    //         this.PopulateLayerEntitesList(i, this.mapLayers[i]);
    //         if (l.GetActiveState())
    //             this.ActivateMapLayer(i, true);
    //     }

    //     // Non-existent (ghost) layers (Note: external sources)
    //     for (let i = 0; i < this.ghostMapLayers.length; i++) {
    //         const g = this.ghostMapLayers[i];
    //         var listItem = document.createElement("a");
    //         listItem.innerHTML = g.layerName;
    //         listItem.setAttribute("class", "list-group-item list-group-item-danger d-flex justify-content-between align-items-center");
    //         // TODO: disabled for now
    //         // listItem.onclick = function() {
    //         //     App.Instance.DownloadGhostLayer(i);
    //         // };
    //         listItem.setAttribute("href", "#");

    //         var badge = document.createElement("span");
    //         badge.innerHTML = "Ke stažení";
    //         badge.setAttribute("class", "badge bg-primary rounded-pill");

    //         listItem.appendChild(badge);
    //         layersList.appendChild(listItem);
    //     }
    // }

    private FlushLayers() {
        const layersList = document.getElementById("layersList");
        layersList.innerHTML = "";
        this.mapLayers = [];
    }

    private AddToLayerList(index: number = undefined) {
        const layersList = document.getElementById("layersList");

        if (index === undefined)
            index = this.mapLayers.length - 1
        let l = this.mapLayers[index];

        // Accordions
        var accordion = document.createElement("a");
        accordion.setAttribute("class", "list-group-item list-group-item-dark");
        accordion.setAttribute("href", "#");
        accordion.innerHTML = l.layerName;

        var accordionCollapse = document.createElement("div");
        accordionCollapse.setAttribute("class", "accordion-collapse collapse bg-secondary");
        accordionCollapse.setAttribute("id", "layer_"+index);
        accordion.onclick = () => {
            this.ActivateMapLayer(index);
        };

        var accordionBody = document.createElement("div");
        accordionBody.setAttribute("class", "accordion-body");

        var routesHeader = document.createElement("h7");
        routesHeader.innerHTML = "Elementy vrstvy";
        accordionBody.appendChild(routesHeader);

        var entityList = document.createElement("div");
        accordionBody.appendChild(entityList);

        accordionCollapse.appendChild(accordionBody);


        layersList.appendChild(accordion);
        layersList.appendChild(accordionCollapse);

        this.PopulateLayerEntitesList(index, this.mapLayers[index]);

        // // Non-existent (ghost) layers (Note: external sources)
        // for (let i = 0; i < this.ghostMapLayers.length; i++) {
        //     const g = this.ghostMapLayers[i];
        //     var listItem = document.createElement("a");
        //     listItem.innerHTML = g.layerName;
        //     listItem.setAttribute("class", "list-group-item list-group-item-danger d-flex justify-content-between align-items-center");
        //     // TODO: disabled for now
        //     // listItem.onclick = function() {
        //     //     App.Instance.DownloadGhostLayer(i);
        //     // };
        //     listItem.setAttribute("href", "#");

        //     var badge = document.createElement("span");
        //     badge.innerHTML = "Ke stažení";
        //     badge.setAttribute("class", "badge bg-primary rounded-pill");

        //     listItem.appendChild(badge);
        //     layersList.appendChild(listItem);
        // }
    }

    private SaveLayersToLocalStorage() {
        let layersToSave: Object[] = [];
        this.mapLayers.forEach(mapLayer => {
            layersToSave.push(mapLayer.Serialize());
        });
        localStorage.setItem("savedLayers", JSON.stringify(layersToSave));
    }

    public LoadLayersFromLocalStorage() {
        let storageLayers = localStorage.getItem("savedLayers");
        if (storageLayers === null)
            return;
        let storageLayersParsed = JSON.parse(storageLayers);
        this.FlushLayers();
        storageLayersParsed.forEach(storageLayer => {
            let deserializedLayer = MapLayer.Deserialize(storageLayer);
            this.AddMapLayer(deserializedLayer);
        });
    }

    // https://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
    private SetupGPXLoader() {
        let fileInput = document.getElementById("gpxFileInput");
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (!target.files)
                return;
            let file = target.files[0];

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
                }

                let addFunction = (name: string) => {
                    let gpxLayer = new MapLayer(name);
                    gpxLayer.AddMapRoad(new SingleMapRoad(pointsArr, elevArr, "purple"));
                    this.AddMapLayer(gpxLayer);
                    this.SaveLayersToLocalStorage();
                }
                this.fileLoader.SpawnNameInput("gpxFileInputContainer", addFunction);

            };
            reader.readAsText(file);
        }
    }

    private SetupShapefileLoader() {
        let fileInput = document.getElementById("shapefileInput");
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (!target.files)
                return;
            let file = target.files[0];
            let reader = new FileReader();
            reader.onload = (e: Event) => {
                shp(reader.result)
                .then((geojson) => {
                    let multiPointsArr: L.LatLng[][] = [];
                    let multiElevArr: number[][] = [];
                    geojson["features"].forEach(feature => {
                        let pointsArr: L.LatLng[] = [];
                        let elevArr: number[] = [];
                        feature["geometry"]["coordinates"].forEach(coords => {
                            // let gpsPoint = proj4("EPSG:5514", "EPSG:4326", coords); // NOTE: .prj file must have correct projection spec
                            pointsArr.push(new L.LatLng(coords[1], coords[0]));
                            elevArr.push(coords[2]);
                            this.PushToLog(coords);
                        });
                        multiPointsArr.push(pointsArr);
                        multiElevArr.push(elevArr);
                        this.PushToLog(" ");
                    });

                    let addFunction = (name: string) => {
                        let shapefileLayer = new MapLayer(name);
                        shapefileLayer.AddMultiRoad(new MultiMapRoad(multiPointsArr, multiElevArr, "blue"));
                        App.Instance.AddMapLayer(shapefileLayer);
                        this.SaveLayersToLocalStorage();
                    }
                    App.Instance.fileLoader.SpawnNameInput("shapefileInputContainer", addFunction);
                })
                .catch(error => console.error(error.stack));
            };
            reader.readAsArrayBuffer(file);
        }
    }

    public RenderElevationMarker(point?: L.LatLng) {
        App.Instance.mapWindow.RenderElevationMarker(point);
    }

    private AddKeyListener() {
        document.addEventListener("keydown", (event) => {
            // var name = event.key;
            if (event.code == "Backquote")
                this.ToggleLog();
          }, false);
    }

    public ToggleLog() {
        let logModalElement = document.getElementById("logModal");
        if (!logModalElement.classList.contains("show")) {
            let logModal = new Modal(logModalElement);
            logModal.show();
        }
    }

    private PushToLog(text: string) {
        let logBody = document.getElementById("logModalBody");
        let line = document.createElement("p");
        line.innerHTML = text;
        logBody.appendChild(line);
    }

    // https://stackoverflow.com/questions/8178825/create-text-file-in-javascript
    private SaveLogToDisk() {
        let logLines = document.getElementById("logModalBody").children;
        let text: string = "";
        
        for (let i = 0; i < logLines.length; i++) {
            const line = logLines[i].innerHTML;
            text += line + "\n";
        }

        console.log([text]);
        let data = new Blob([text], {type: "text/plain"});
        let link = window.URL.createObjectURL(data);
        this.DownloadLink(link);
        window.URL.revokeObjectURL(link);
    }

    // https://stackoverflow.com/questions/11620698/how-to-trigger-a-file-download-when-clicking-an-html-button-or-javascript
    private DownloadLink(link: string) {
        const a = document.createElement("a");
        a.href = link;
        a.download = link.split("/").pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
