import { MapWindow } from "./mapwindow";
import { MapLayer } from "./maplayer";
import { SingleMapRoad } from "./singleroad";
import { MultiMapRoad } from "./multiroad";
import { ElevationChart } from "./elevationchart";
import { FileLoader } from "./fileloader";
import { Offcanvas, Collapse, Modal } from "bootstrap";
import * as L from "leaflet";
import * as shp from "shpjs";
import { DBLayerBuilder } from "./dblayerbuilder";
import { DBMapLayer } from "./dblayer";
import { DBMultiMapRoad } from "./dbmultiroad";
// import proj4 from "proj4";

// http://lepsi-nez-zivot.blogspot.com/2017/08/konverze-s-jtsk-krovak-do-wsg84-gsm-api.html
// https://github.com/proj4js/proj4js
// https://training.gismentors.eu/open-source-gis/knihovny/proj4.html
// proj4.defs("EPSG:4326","+proj=longlat +datum=WGS84 +no_defs");
// proj4.defs("EPSG:5514","+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +pm=greenwich +units=m +no_defs +towgs84=570.8,85.7,462.8,4.998,1.587,5.261,3.56");

// TS Singleton: https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
export class App {
    private mapWindow: MapWindow;
    private localLayers: MapLayer[] = [];
    private activeElevationChart: ElevationChart;
    private sidebarOffcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasNavbar"));
    private fileLoader: FileLoader = new FileLoader();
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

        document.getElementById("logModalSaveButton").onclick = () => {
            this.SaveLogToDisk();
        };

        DBLayerBuilder.SetInteraction();
    }

    public Init(centerLat: number, centerLong: number, zoom: number) {
        this.mapWindow = new MapWindow(centerLat, centerLong, zoom);
        this.SetupButtons();
        this.SetupGPXLoader();
        this.SetupShapefileLoader();
        this.AddKeyListener();
    }

    public AddMapLayer(mapLayer: MapLayer, notFromStorage: boolean = true) {
        this.localLayers.push(mapLayer);
        // this.RenderLayerList();
        this.AddToLayerList();

        if (mapLayer instanceof DBMapLayer && notFromStorage)
            (mapLayer as DBMapLayer).SaveToLocalStorage();
    }

    private PopulateLayerEntitesList(mapLayer: MapLayer, collapseElement: HTMLElement) {
        let entitiesList = collapseElement.children[0].children[1];
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

    public ActivateMapLayer(mapLayer: MapLayer, collapseElement: HTMLElement) {
        if (this.layerActivating)
            return;
        this.layerActivating = true;

        // let mapLayer = this.localLayers[index];
        const mapLayerNewState = !mapLayer.GetAndToggleActiveState();
        this.mapWindow.RenderMapLayer(mapLayer, mapLayerNewState);
        
        if (this.activeElevationChart !== undefined && !mapLayerNewState && this.activeElevationChart.layerID == mapLayer.id)
        this.activeElevationChart.HideChart();

        // let collapseElement = document.getElementById("layer_"+index);
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

    public SetElevationChart(points: L.LatLng[], elevation: number[], layerID: number) {
        if (this.activeElevationChart !== undefined)
            this.activeElevationChart.DestroyChart();
        this.activeElevationChart = new ElevationChart(points, elevation, layerID);
    }

    private FlushLayers() {
        const layersList = document.getElementById("layersList");
        layersList.innerHTML = "";
        this.localLayers = [];
    }

    private AddToLayerList(index: number = undefined) {
        const layersList = document.getElementById("layersList");

        if (index === undefined)
            index = this.localLayers.length - 1
        let l = this.localLayers[index];

        // Accordions
        var accordion = document.createElement("a");
        accordion.setAttribute("class", "list-group-item list-group-item-dark d-flex justify-content-between align-items-center");
        accordion.setAttribute("href", "#");
        accordion.innerHTML = l.layerName;

        var accordionCollapse = document.createElement("div");
        accordionCollapse.setAttribute("class", "accordion-collapse collapse bg-secondary");
        accordion.onclick = () => {
            this.ActivateMapLayer(l, accordionCollapse);
        };

        var accordionBody = document.createElement("div");
        accordionBody.setAttribute("class", "accordion-body");

        var routesHeader = document.createElement("h7");
        routesHeader.innerHTML = "Elementy vrstvy";
        accordionBody.appendChild(routesHeader);

        var entityList = document.createElement("div");
        accordionBody.appendChild(entityList);
       
        if (l instanceof DBMapLayer) {
            var operationDelete = document.createElement("button");
            operationDelete.setAttribute("type", "button");
            operationDelete.setAttribute("class", "btn btn-danger float-end");
            operationDelete.onclick = () => {
                this.RemoveFromLayerList(l, accordionCollapse);
            };
            var operationDeleteIcon = document.createElement("i");
            operationDeleteIcon.setAttribute("class", "bi-trash-fill");
            operationDelete.appendChild(operationDeleteIcon);
            
            accordionBody.appendChild(document.createElement("br"));
            accordionBody.appendChild(operationDelete);
            var br = document.createElement("br");
            br.setAttribute("style", "clear:both");
            accordionBody.appendChild(br);
        }

        accordionCollapse.appendChild(accordionBody);

        layersList.appendChild(accordion);
        layersList.appendChild(accordionCollapse);

        this.PopulateLayerEntitesList(l, accordionCollapse);
    }

    private RemoveFromLayerList(mapLayer: MapLayer, collapseElement: HTMLElement) {
        // Deactive the layer (remove from map)
        this.ActivateMapLayer(mapLayer, collapseElement);
        
        // Remove UI list reference
        collapseElement.previousSibling.remove(); // Link
        collapseElement.remove(); // Collapse
        
        // Remove the layer object from store
        let layerIndex = this.localLayers.indexOf(mapLayer);
        if (layerIndex != -1) {
            this.localLayers.splice(layerIndex, 1);
        }

        // Rebuild localStorage (if DBLayer)
        if (!(mapLayer instanceof DBMapLayer))
            return;

        this.RebuildLocalStorage();
    }

    // private SaveLayersToLocalStorage() {
    //     let layersToSave: Object[] = [];
    //     this.localLayers.forEach(mapLayer => {
    //         if (mapLayer.className === "GeoJSONLayer")
    //             return;
    //         layersToSave.push(mapLayer.Serialize());
    //     });
    //     localStorage.setItem("savedLayers", JSON.stringify(layersToSave));
    // }

    // public LoadLayersFromLocalStorage() {
    //     let storageLayers = localStorage.getItem("savedLayers");
    //     if (storageLayers === null)
    //         return;
    //     let storageLayersParsed = JSON.parse(storageLayers);
    //     this.FlushLayers();
    //     storageLayersParsed.forEach(storageLayer => {
    //         let deserializedLayer = MapLayer.Deserialize(storageLayer);
    //         this.AddMapLayer(deserializedLayer);
    //     });
    // }

    public LoadFromLocalStorage() {
        if (localStorage["dblayers"] === undefined)
            return;

        let storageList = JSON.parse(localStorage["dblayers"]);
        storageList.forEach(layerInfo => {
            let layer = new DBMapLayer(layerInfo["name"]);
            layerInfo["ids"].forEach(id => {
                let road = new DBMultiMapRoad(id);
                // TODO: Something more elegant (+ maybe user indication, that something's been yeeted)
                if (!road.wasRemoved)
                    layer.AddMapRoad(road);
            });
            this.AddMapLayer(layer, false);
        });
    }

    // Used after layer removal
    private RebuildLocalStorage() {
        localStorage.removeItem("dblayers");

        this.localLayers.forEach(mapLayer => {
            if (mapLayer instanceof DBMapLayer)
                (mapLayer as DBMapLayer).SaveToLocalStorage();
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
                    // this.SaveLayersToLocalStorage();
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
                        });
                        multiPointsArr.push(pointsArr);
                        multiElevArr.push(elevArr);
                    });

                    let addFunction = (name: string) => {
                        let shapefileLayer = new MapLayer(name);
                        shapefileLayer.AddMapRoad(new MultiMapRoad(multiPointsArr, multiElevArr, "Cesta", "blue"));
                        App.Instance.AddMapLayer(shapefileLayer);
                        // this.SaveLayersToLocalStorage();
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

    public PushToLog(text: string) {
        let logBody = document.getElementById("logModalBody");
        let line = document.createElement("p");
        line.innerHTML = text;
        logBody.appendChild(line);
    }

    public SaveTextToDisk(text: string, filename: string, type: string = "text/plain") {
        let data = new Blob([text], {type: "text/plain"});
        let link = window.URL.createObjectURL(data);
        this.DownloadLink(link, filename);
        window.URL.revokeObjectURL(link);
    }

    // https://stackoverflow.com/questions/8178825/create-text-file-in-javascript
    private SaveLogToDisk() {
        let logLines = document.getElementById("logModalBody").children;
        let text: string = "";
        
        for (let i = 0; i < logLines.length; i++) {
            const line = logLines[i].innerHTML;
            text += line + "\n";
        }

        this.SaveTextToDisk(text, "log.txt", "text/plain");
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

    public PushAlert(message: string, linkVerbage?: string, linkFunction?: Function, type: string = "primary") {
        const alertPlace = document.getElementById("alertPlace");
        
        let alert = document.createElement("div");
        alert.setAttribute("class", `alert alert-${type} alert-dismissible`);
        alert.setAttribute("role", "alert");
        alert.innerHTML = message + " ";

        let dismissButton = document.createElement("button");
        dismissButton.setAttribute("type", "button");
        dismissButton.setAttribute("class", "btn-close");
        dismissButton.setAttribute("data-bs-dismiss", "alert");
        dismissButton.setAttribute("aria-label", "Close");

        if (linkVerbage !== undefined && linkFunction !== undefined) {
            let link = document.createElement("a");
            link.setAttribute("href", "#");
            link.setAttribute("class", "alert-link");
            link.setAttribute("id", "alertLink");
            link.setAttribute("data-bs-dismiss", "alert");
            link.innerHTML = linkVerbage;
            alert.appendChild(link);

            // Give the link a purpose
            link.onclick = (event) => {
                linkFunction();
            };
        }
        
        alert.appendChild(dismissButton);
        alertPlace.appendChild(alert);
    }

    public ToggleThrobber() {
        let throbberOverlay = document.getElementById("throbberOverlay");
        if (throbberOverlay.style.display != "") {
            throbberOverlay.style.display = "";
        }
        else
            throbberOverlay.style.display = "none";
    }
}
