class Marker {
    lat: number;
    long: number;
    popupMsg: string;

    constructor(lat: number, long: number, popupMsg?: string) {
        this.lat = lat;
        this.long = long;
        this.popupMsg = popupMsg;
    }

    GetMapMarker(): L.Marker {
        var marker = L.marker([this.lat, this.long]);
        if (this.popupMsg !== 'undefined')
            marker.bindPopup(this.popupMsg);
        return marker;
    }
}

// class App

class MapWindow {
    map: L.Map;
    layerControl: L.Control.Layers;
    layerGroups: L.LayerGroup[] = [];
    
    constructor(centerLat: number, centerLong: number, zoom: number) {
        var baseMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

    CreateInitialLayers(baseMapLayer: L.TileLayer, baseMapName: string) {
        var baseMapsControl = {
            [baseMapName]: baseMapLayer,
        };
        var overlayMapsControl = {};

        this.layerControl = L.control.layers(baseMapsControl, overlayMapsControl).addTo(this.map);
    }

    CreateLayerGroup(markers: Marker[], layerGroupName: string) {
        var mapMarkers: L.Marker[] = [];
        markers.forEach(m => {
            mapMarkers.push(m.GetMapMarker());
        });

        this.layerGroups.push(L.layerGroup(mapMarkers));
        this.layerGroups[this.layerGroups.length - 1].addTo(this.map);

        var listItem = document.createElement("li");
        listItem.innerHTML = layerGroupName;
        document.getElementById("layersList").appendChild(listItem);
    }
}

let map = new MapWindow(49.86, 15.51, 8);
map.CreateLayerGroup([
    new Marker(49.86, 15.511, "This is a popup #1"),
    new Marker(49.86, 15.512, "This is a popup #2"),
    new Marker(49.86, 15.513, "This is a popup #3"),
    new Marker(49.86, 15.514, "This is a popup #4")
], "Místa")
