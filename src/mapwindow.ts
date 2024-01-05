import L from "leaflet";
import { MapLayer } from "./maplayer";

export class MapWindow {
    protected map: L.Map;
    // private layerControl: L.Control.Layers;
    
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
    }

    public RenderMapLayer(mapLayer: MapLayer, render: boolean = true) {
        if (render) {
            mapLayer.GetLayerGroup().then((layerGroup) => {
                layerGroup.addTo(this.map);
            });
        }
        else
            this.map.removeLayer(mapLayer.activeLayerGroup);
    }

    public WarpToPoint(point: L.LatLng, zoom: number = 12) {
        this.map.setView(point, zoom);
    }
}