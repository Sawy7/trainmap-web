import * as L from "leaflet";
import { MapMarker } from "./mapmarker";
import { SingleMapRoad } from "./singleroad";
import { MultiMapRoad } from "./multiroad";
import { MapArea } from "./maparea";

export class MapLayer {
    private layerMarkers: MapMarker[] = [];
    private layerRoads: SingleMapRoad[] = [];
    private multiRoads: MultiMapRoad[] = [];
    private layerAreas: MapArea[] = [];
    public activeLayerGroup: L.LayerGroup;
    private activeMapEntities: (L.Marker | L.Polyline | L.Polygon)[];
    public layerName: string;
    private isActive: boolean = false;

    public constructor(name: string) {
        this.layerName = name;
    }

    public AddMapMarker(marker: MapMarker) {
        this.layerMarkers.push(marker);
    }

    public AddMapRoad(road: SingleMapRoad) {
        this.layerRoads.push(road);
    }

    public AddMultiRoad(road: MultiMapRoad) {
        this.multiRoads.push(road);
    }

    public AddMapArea(area: MapArea) {
        this.layerAreas.push(area);
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
        this.activeMapEntities = [];
        this.layerMarkers.forEach(m => {
            this.activeMapEntities.push(m.GetMapEntity());
        });
        this.layerRoads.forEach(r => {
            this.activeMapEntities.push(r.GetMapEntity());
        });
        this.multiRoads.forEach(r => {
            this.activeMapEntities.push(r.GetMapEntity());
        });
        this.layerAreas.forEach(a => {
            this.activeMapEntities.push(a.GetMapEntity());
        });

        return L.layerGroup(this.activeMapEntities);
    }

    public ListMapEntities(): string[] {
        let listInfo: string[] = [];
        // let listActionInfo: [string[], Function][];

        this.layerMarkers.forEach(m => {
            listInfo.push(m.GetListInfo());
        });
        this.layerRoads.forEach(r => {
            listInfo.push(r.GetListInfo());
        });
        this.multiRoads.forEach(r => {
            listInfo.push(r.GetListInfo());
        });
        this.layerAreas.forEach(a => {
            listInfo.push(a.GetListInfo());
        });

        return listInfo;
    }
}
