import L from "leaflet";
import { MapArea } from "./maparea";
import { MapEntity } from "./mapentity";
import { MapMarker } from "./mapmarker";
import { MapRoad } from "./maproad";

export class MapLayer {
    protected layerEntities: MapEntity[] = [];
    public activeLayerGroup: L.LayerGroup;
    public layerName: string;
    protected layerColor: string;
    private isActive: boolean = false;
    static globalIDGen: number = -1;
    readonly id: number;
    readonly className: string = "MapLayer";

    public constructor(name: string, color?: string, id?: number) {
        this.layerName = name;
        this.layerColor = color;
        if (id === undefined)
            this.id = ++MapLayer.globalIDGen;
        else {
            this.id = id;
            MapLayer.globalIDGen = Math.max(MapLayer.globalIDGen, id);
        }
    }

    public Activate(state: boolean): boolean {
        this.isActive = state;
        return state;
    }

    public GetActiveState() {
        return this.isActive;
    }

    public GetAndToggleActiveState() {
        this.isActive = !this.isActive;
        return !this.isActive;
    }

    public AddMapMarkers(...marker: MapMarker[]) {
        this.layerEntities.push(...marker);
    }

    public AddMapRoads(...road: MapRoad[]) {
        this.layerEntities.push(...road);
    }

    public AddMapAreas(...area: MapArea[]) {
        this.layerEntities.push(...area);
    }

    public CreateLayerGroup(): L.LayerGroup {
        let activeMapEntities: (L.Marker | L.Polyline | L.Polygon)[] = [];

        this.layerEntities.forEach(e => {
            let gotEntity = e.GetMapEntity();
            if (e instanceof MapRoad) {
                e.SetupInteractivity(this.id);
                if (this.layerColor !== undefined)
                    gotEntity.setStyle({color: this.layerColor});
            }
            activeMapEntities.push(gotEntity);
        });

        return L.layerGroup(activeMapEntities);
    }

    public GetLayerGroup(): Promise<L.LayerGroup> {
        this.activeLayerGroup = this.CreateLayerGroup();

        return new Promise((resolve) => {
            resolve(this.activeLayerGroup);
        });
    }

    public GetLayerEntities(): MapEntity[] {
        return this.layerEntities;
    }
}
