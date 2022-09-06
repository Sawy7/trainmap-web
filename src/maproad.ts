import * as L from "leaflet";
import { MapEntity } from "./mapentity";
import { App } from "./app";

export abstract class MapRoad extends MapEntity {
    // protected points: any;
    // protected elevation: any;
    protected color: string;
    protected weight: number;
    protected opacity: number;
    protected smoothFactor: number;
    protected polyLine: L.Polyline;
    readonly className: string = "MapRoad";

    protected constructor(
                name: string = "Cesta",
                color: string = "red",
                weight: number = 5,
                opacity: number = 0.5,
                smoothFactor: number = 1,
                dbID: number = undefined
    ) {
        super(dbID);
        this.name = name;
        this.color = color;
        this.weight = weight;
        this.opacity = opacity;
        this.smoothFactor = smoothFactor;
        this.dontSerializeList = [
            "polyLine"
        ]
    }

    public abstract GetMapEntity(): L.Polyline;

    public abstract GetSignificantPoint(): L.LatLng;

    public abstract SetupInteractivity(layerID: number);
}
