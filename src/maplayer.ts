import * as L from "leaflet";
import { MapEntity } from "./mapentity";

export abstract class MapLayer {
    public activeLayerGroup: L.LayerGroup;
    public layerName: string;
    private isActive: boolean = false;
    static globalIDGen: number = -1;
    readonly id: number;
    readonly className: string = "MapLayer";

    public constructor(name: string) {
        this.layerName = name;
        this.id = ++MapLayer.globalIDGen;
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

    public abstract CreateLayerGroup(): L.LayerGroup;

    public GetLayerGroup(): L.LayerGroup {
        this.activeLayerGroup = this.CreateLayerGroup();
        return this.activeLayerGroup;
    }

    public abstract GetLayerEntities(): MapEntity[];

    public abstract Serialize(): Object;
}
