import * as L from "leaflet";
import { MapMarker } from "./mapmarker";
import { MapRoad } from "./maproad";
import { MapArea } from "./maparea";

export class MapLayer {
    private layerMarkers: MapMarker[] = [];
    private layerRoads: MapRoad[] = [];
    private layerAreas: MapArea[] = [];
    // private layerGroup: L.LayerGroup;
    public activeLayerGroup: L.LayerGroup;
    public layerName: string;
    private isActive: boolean = false;

    public constructor(name: string) {
        this.layerName = name;
        // this.layerMarkers = markers;
        // this.layerRoads = roads;
        // this.layerAreas = areas;
        // this.CreateLayerGroup();
    }

    public AddMapMarker(marker: MapMarker) {
        this.layerMarkers.push(marker);
        // this.CreateLayerGroup()
    }

    public AddMapRoad(road: MapRoad) {
        this.layerRoads.push(road);
        // this.CreateLayerGroup()
    }

    public AddMapArea(area: MapArea) {
        this.layerAreas.push(area);
        // this.CreateLayerGroup()
    }

    public GetActiveState() {
        return this.isActive;
    }

    public GetAndToggleActiveState() {
        this.isActive = !this.isActive;
        return !this.isActive;
    }

    public GetLayerGroup() {
        this.activeLayerGroup = this.CreateLayerGroup();
        return this.activeLayerGroup;
    }

    public CreateLayerGroup() {
        var mapEntities: (L.Marker | L.Polyline | L.Polygon)[] = [];
        this.layerMarkers.forEach(m => {
            mapEntities.push(m.GetMapEntity());
        });
        this.layerRoads.forEach(r => {
            mapEntities.push(r.GetMapEntity());
        });
        this.layerAreas.forEach(r => {
            mapEntities.push(r.GetMapEntity());
        });

        return L.layerGroup(mapEntities);
    }
}
