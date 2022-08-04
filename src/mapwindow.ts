import * as L from "leaflet";
import { MapLayer } from "./maplayer";
import { MapMarker } from "./mapmarker";

export class MapWindow {
    private map: L.Map;
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

        this.CreateInitialLayers(baseMapLayer, "OpenStreetMap");
    }

    private CreateInitialLayers(baseMapLayer: L.TileLayer, baseMapName: string) {
        var baseMapsControl = {
            [baseMapName]: baseMapLayer,
        };
        var overlayMapsControl = {};

        // NOTE: This adds a button to switch map provider
        // this.layerControl = L.control.layers(baseMapsControl, overlayMapsControl).addTo(this.map);
    }

    public RenderMapLayer(mapLayer: MapLayer, render: boolean = true) {
        if (render)
            mapLayer.GetLayerGroup().addTo(this.map);
        else
            this.map.removeLayer(mapLayer.activeLayerGroup);
    }

    public RenderRogueMarker(marker: MapMarker, render: boolean = true) {
        if (render)
            marker.GetMapEntity().addTo(this.map);
        else
            this.map.removeLayer(marker.activeMarker);
    }
}
