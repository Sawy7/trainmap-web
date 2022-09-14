import L from "leaflet";
import { MapEntityFactory } from "./mapentityfactory";
import { MapLayer } from "./maplayer";
import { MapMarker } from "./mapmarker";

export class MapWindow {
    private map: L.Map;
    private activeElevationMarker: MapMarker;
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
        if (render) {
            mapLayer.GetLayerGroup().then((layerGroup) => {
                layerGroup.addTo(this.map);
            });
            // mapLayer.GetLayerGroup().addTo(this.map);
        }
        else
            this.map.removeLayer(mapLayer.activeLayerGroup);
    }

    public RenderElevationMarker(point?: L.LatLng) {
        if (point === undefined) {
            if (this.activeElevationMarker === undefined)
                return;
            this.map.removeLayer(this.activeElevationMarker.GetMapEntity());
            this.activeElevationMarker = undefined;
            return;
        }

        if (this.activeElevationMarker === undefined) {
            this.activeElevationMarker = MapEntityFactory.CreateMapMarker(point, "", "E", true);
            this.activeElevationMarker.GetMapEntity().addTo(this.map);
        }
        else {
            this.activeElevationMarker.ChangeCoordinates(point);
        }
        // if (render)
        //     marker.GetMapEntity().addTo(this.map);
        // else
        //     this.map.removeLayer(marker.activeMarker);
    }

    public WarpToPoint(point: L.LatLng) {
        this.map.setView(point, 15);
    }
}
