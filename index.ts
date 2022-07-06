// JS Requests: https://stackoverflow.com/questions/247483/http-get-request-in-javascript
class ApiComms {
    static GetRequest(url: string) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

    static GetRequestAsync(url: string, callback: Function) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }
}

interface MapEntity {
    GetMapEntity(): any;
}

class MapMarker implements MapEntity {
    public point: L.LatLng;
    public popupMsg: string;

    public constructor(point: L.LatLng, popupMsg: string) {
        this.point = point;
        this.popupMsg = popupMsg;
    }

    public GetMapEntity(): L.Marker {
        var marker = L.marker([this.point.lat, this.point.lng]);
        marker.bindPopup(this.popupMsg);
        return marker;
    }
}

class MapRoad implements MapEntity {
    private points: L.LatLng[];
    private popupMsg: string;
    private color: string;
    private weight: number;
    private opacity: number;
    private smoothFactor: number;

    public constructor(points: L.LatLng[],
                popupMsg: string,
                color: string = "red",
                weight: number = 5,
                opacity: number = 0.5,
                smoothFactor: number = 1
                ) {
        this.points = points;
        this.popupMsg = popupMsg;
        this.color = color;
        this.weight = weight;
        this.opacity = opacity;
        this.smoothFactor = smoothFactor;
    }

    public GetMapEntity(): L.Polyline {
        var polyline = new L.Polyline(this.points, {
            color: this.color,
            weight: this.weight,
            opacity: this.opacity,
            smoothFactor: this.smoothFactor
        });
        polyline.bindPopup(this.popupMsg);
        return polyline;
    }
}

class MapLayer {
    private layerMarkers: MapMarker[];
    private layerRoads: MapRoad[];
    public layerGroup: L.LayerGroup;
    public layerName: string;
    private isActive: boolean = false;

    public constructor(markers: MapMarker[], roads: MapRoad[], name: string) {
        this.layerMarkers = markers;
        this.layerRoads = roads;
        this.layerName = name;
        this.CreateLayerGroup()
    }

    public AddMapMarker(marker: MapMarker) {
        this.layerMarkers.push(marker);
    }

    public AddMapRoad(road: MapRoad) {
        this.layerRoads.push(road);
    }

    public GetAndToggleActiveState() {
        this.isActive = !this.isActive;
        return !this.isActive;
    } 

    private CreateLayerGroup() {
        var mapEntities: (L.Marker | L.Polyline)[] = [];
        this.layerMarkers.forEach(m => {
            mapEntities.push(m.GetMapEntity());
        });
        this.layerRoads.forEach(r => {
            mapEntities.push(r.GetMapEntity());
        });

        this.layerGroup = L.layerGroup(mapEntities);
    }
}

class GhostMapLayer {
    public layerName: string;
    private layerLink: string;

    public constructor(name: string, link: string) {
        this.layerName = name;
        this.layerLink = link;
    }

    public Download(): MapLayer {
        return new MapLayer([], [], this.layerName);
    }
}

// TS Singleton: https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
class App {
    private mapWindow: MapWindow;
    private mapLayers: MapLayer[] = [];
    private ghostMapLayers: GhostMapLayer[] = [];
    private static _instance: App;

    private constructor(){};

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public Init(centerLat: number, centerLong: number, zoom: number) {
        this.mapWindow = new MapWindow(centerLat, centerLong, zoom);
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

    private RenderLayerList() {
        const layersList = document.getElementById("layersList");
        layersList.innerHTML = "";

        for (let i = 0; i < this.mapLayers.length; i++) {
            const l = this.mapLayers[i];
            var listItem = document.createElement("a");
            listItem.innerHTML = l.layerName;
            listItem.setAttribute("class", "list-group-item");
            listItem.setAttribute("href", `javascript:App.Instance.ActivateMapLayer(${i})`);
            layersList.appendChild(listItem);
        }

        // Non-existent (ghost) layers (Note: external sources)
        for (let i = 0; i < this.ghostMapLayers.length; i++) {
            const g = this.ghostMapLayers[i];
            var listItem = document.createElement("a");
            listItem.innerHTML = g.layerName;
            listItem.setAttribute("class", "list-group-item list-group-item-danger d-flex justify-content-between align-items-center");
            listItem.setAttribute("href", `javascript:App.Instance.DownloadGhostLayer(${i})`);
            
            var badge = document.createElement("span");
            badge.innerHTML = "Ke stažení";
            badge.setAttribute("class", "badge bg-primary rounded-pill");
            
            listItem.appendChild(badge);
            layersList.appendChild(listItem);
        }
    }

    private SetActiveInLayerList(index: number, state: boolean) {
        const layers = document.getElementById("layersList").children;

        if (state)
            layers[index].setAttribute("class", "list-group-item active");
        else
            layers[index].setAttribute("class", "list-group-item");
    }

    public ActivateMapLayer(index: number) {
        let mapLayer = this.mapLayers[index];
        const mapLayerNewState = !mapLayer.GetAndToggleActiveState();
        this.SetActiveInLayerList(index, mapLayerNewState);
        this.mapWindow.RenderMapLayer(this.mapLayers[index], mapLayerNewState);
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
}

class MapWindow {
    private map: L.Map;
    private layerControl: L.Control.Layers;
    
    public constructor(centerLat: number, centerLong: number, zoom: number) {
        var baseMapLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        });

        this.map = L.map('map', {
            center: [centerLat, centerLong],
            zoom: zoom,
            layers: [baseMapLayer]
        });

        this.CreateInitialLayers(baseMapLayer, "OpenStreetMap");
    }

    private CreateInitialLayers(baseMapLayer: L.TileLayer, baseMapName: string) {
        var baseMapsControl = {
            [baseMapName]: baseMapLayer,
        };
        var overlayMapsControl = {};

        this.layerControl = L.control.layers(baseMapsControl, overlayMapsControl).addTo(this.map);
    }

    RenderMapLayer(mapLayer: MapLayer, render: boolean = true) {
        if (render)
            mapLayer.layerGroup.addTo(this.map);
        else
            this.map.removeLayer(mapLayer.layerGroup);
    }
}

let app = App.Instance;
app.Init(49.86, 15.51, 15);
let myPoints = new MapLayer([
    new MapMarker(new L.LatLng(49.86, 15.511), "This is a popup #1"),
    new MapMarker(new L.LatLng(49.86, 15.512), "This is a popup #2"),
    new MapMarker(new L.LatLng(49.86, 15.513), "This is a popup #3"),
    new MapMarker(new L.LatLng(49.86, 15.514), "This is a popup #4")
], [], "Moje body #1");

app.AddMapLayer(myPoints);

let myRoads = new MapLayer([], [
    new MapRoad([
        new L.LatLng(49.86, 15.511),
        new L.LatLng(49.861, 15.512),
        new L.LatLng(49.86, 15.513),
        new L.LatLng(49.86, 15.514)
    ], "This is a road popup #1!"),
    new MapRoad([
        new L.LatLng(49.859, 15.511),
        new L.LatLng(49.859, 15.512),
        new L.LatLng(49.858, 15.513),
        new L.LatLng(49.859, 15.514)
    ], "This is a road popup #2!")
], "Moje cesty #1");

app.AddMapLayer(myRoads);

let apiLayer = new GhostMapLayer("Moje cesty z externího API", "http://api.com/endpoint");
let apiLayer2 = new GhostMapLayer("Moje cesty z externího API 2", "http://api.com/endpoint");
app.AddGhostMapLayer(apiLayer);
app.AddGhostMapLayer(apiLayer2);

ApiComms.GetRequestAsync("https://catfact.ninja/fact", console.log);
