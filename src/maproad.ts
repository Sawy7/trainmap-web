import L from "leaflet";
import { MapEntity } from "./mapentity";

export abstract class MapRoad extends MapEntity {
    readonly className: string = "MapRoad";

    protected constructor() {
        super();
    }

    abstract GetMapEntity(): any; 

    abstract GetSignificantPoint(): L.LatLng;

    abstract SetupInteractivity(layerID: number);
}
